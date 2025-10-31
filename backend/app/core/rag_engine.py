import os
import logging
from typing import List, Tuple, Dict, Any

from fastapi import HTTPException
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain.schema import Document

# Retrieval upgrades
from langchain.retrievers import ContextualCompressionRetriever, MultiQueryRetriever
from langchain.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder

from app.config.settings import settings
from app.core.utils import clean_repetitive_text, count_tokens, truncate_documents

logger = logging.getLogger(__name__)

PROMPT_TEMPLATE = """You are an expert researcher. Your task is to provide a thorough answer using ONLY the provided context.

CONTEXT: {context}

USER QUESTION: {question}

REQUIREMENTS:
- Use EVERY relevant piece of information from the context
- Create a comprehensive answer by combining all relevant details
- Include specific facts, numbers, examples, and context from the context
- Structure your answer logically with multiple points if applicable
- If the context contains partial information, use what's available
- Do NOT add external knowledge - only use the provided text
- Respond in the user's language
- Add blank lines between different sections and paragraphs for better readability

COMPREHENSIVE ANSWER:"""

class RAGEngine:
    def _init_(self):
        self.vectordb: Chroma | None = None
        self.llm: ChatGroq | None = None
        self.qa: RetrievalQA | None = None
        self.retriever = None           # final composed retriever (MultiQuery -> Rerank)
        self.base_retriever = None      # base vectorstore retriever

    # ---- Builders ----

    def _build_llm(self) -> ChatGroq:
        api_key = settings.GROQ_API_KEY
        if not api_key:
            raise RuntimeError("Missing GROQ_API_KEY")
        os.environ["GROQ_API_KEY"] = api_key
        return ChatGroq(
            model=settings.LLM_MODEL,
            temperature=settings.LLM_TEMPERATURE,
            api_key=api_key,
        )

    def _build_embeddings(self) -> SentenceTransformerEmbeddings:
        # Must match the model used during indexing/persist to avoid mismatch.
        return SentenceTransformerEmbeddings(model_name=settings.EMBEDDING_MODEL)

    def _build_vectorstore(self) -> Chroma:
        return Chroma(
            persist_directory=settings.DB_PATH,
            embedding_function=self._build_embeddings(),
        )

    def _build_base_retriever(self):
        # Use settings to compute fetch_k and lambda_mult.
        fetch_k_multiplier = getattr(settings, "FETCH_K_MULTIPLIER", 10)
        min_fetch_k = getattr(settings, "MIN_FETCH_K", 60)
        lambda_mult = getattr(settings, "LAMBDA_MULT", 0.2)
        fetch_k = max(min_fetch_k, settings.RETRIEVAL_K * fetch_k_multiplier)
        return self.vectordb.as_retriever(
            search_type="mmr",
            search_kwargs={
                "k": settings.RETRIEVAL_K,          # final top-k
                "fetch_k": fetch_k,                 # candidate pool
                "lambda_mult": lambda_mult,         # diversity/similarity balance
            },
        )

    def _build_multiquery_retriever(self, base_retriever):
        # Keep behavior but read all variables from settings where applicable.
        mq_prompt = PromptTemplate.from_template(
            "You expand search queries for retrieval.\n"
            "Given a question, produce 4 alternative queries that expand acronyms, aliases, and synonyms.\n"
            "Return only the 4 queries, one per line, no numbering, no bullets, no explanations.\n"
            "Question: {question}"
        )
        return MultiQueryRetriever.from_llm(
            retriever=base_retriever,
            llm=self.llm,
            prompt=mq_prompt,
            include_original=True,
        )

    def _wrap_with_reranker(self, base_retriever):
        try:
            reranker_model = getattr(settings, "RERANKER_MODEL", "BAAI/bge-reranker-base")
            # Align top_n with settings while preserving the existing safeguard.
            base_top_n = getattr(settings, "RERANKER_TOP_N", settings.RETRIEVAL_K)
            top_n = max(base_top_n, settings.RETRIEVAL_K)
            rerank_model = HuggingFaceCrossEncoder(model_name=reranker_model)
            compressor = CrossEncoderReranker(model=rerank_model, top_n=top_n)
            return ContextualCompressionRetriever(base_retriever=base_retriever, base_compressor=compressor)
        except Exception as e:
            logger.warning(f"Reranker unavailable, falling back to base retriever: {e}")
            return base_retriever

    # ---- Lifecycle ----

    def initialize(self):
        """Initialize RAG components with settings-driven parameters."""
        try:
            logger.info("Initializing RAG components...")
            self.llm = self._build_llm()
            self.vectordb = self._build_vectorstore()

            # Base retriever (vectorstore-backed)
            self.base_retriever = self._build_base_retriever()

            # Multi-query expansion -> rerank
            mq_retriever = self._build_multiquery_retriever(self.base_retriever)
            self.retriever = self._wrap_with_reranker(mq_retriever)

            prompt = PromptTemplate(template=PROMPT_TEMPLATE, input_variables=["context", "question"])

            # Single QA chain reusing the composed retriever
            self.qa = RetrievalQA.from_chain_type(
                llm=self.llm,
                retriever=self.retriever,
                chain_type="stuff",
                chain_type_kwargs={"prompt": prompt},
                return_source_documents=True,
            )

            logger.info("✅ RAG pipeline ready (settings-aligned)")
        except Exception as e:
            logger.error(f"Error initializing RAG: {str(e)}")
            raise

    # ---- Inference ----

    def ask_comprehensive_question(self, question: str, max_tokens: int = 300) -> Tuple[str, List[Dict[str, Any]]]:
        """Get comprehensive answer with token control."""
        try:
            # Use the composed retriever via Runnable API
            docs: List[Document] = self.retriever.invoke(question)

            # Settings-driven truncation thresholds
            max_ctx = getattr(settings, "MAX_CONTEXT_TOKENS", 2500)
            hard_prompt_limit = getattr(settings, "PROMPT_TOKEN_HARD_LIMIT", 5500)
            fallback_ctx = getattr(settings, "FALLBACK_CONTEXT_TOKENS", 3500)

            # Build truncated context
            context = truncate_documents(docs, max_context_tokens=max_ctx)
            formatted_prompt = PROMPT_TEMPLATE.format(context=context, question=question)

            total_tokens = count_tokens(formatted_prompt)
            logger.info(f"Total prompt tokens: {total_tokens}")

            if total_tokens > hard_prompt_limit:
                context = truncate_documents(docs, max_context_tokens=fallback_ctx)
                formatted_prompt = PROMPT_TEMPLATE.format(context=context, question=question)

            # Send to LLM
            response = self.llm.invoke(formatted_prompt)
            answer = response.content if hasattr(response, "content") else str(response)
            answer = clean_repetitive_text(answer)

            # Build sources
            sources: List[Dict[str, Any]] = []
            for i, doc in enumerate(docs):
                sources.append({
                    "document": doc.metadata.get("source", f"Document {i+1}"),
                    "content": (doc.page_content[:200] + "...") if len(doc.page_content) > 200 else doc.page_content,
                    "score": doc.metadata.get("score"),
                    "title": doc.metadata.get("title"),
                })

            return answer, sources

        except Exception as e:
            logger.error(f"RAG processing failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"RAG processing failed: {str(e)}")

    def ask_concise_question(self, question: str) -> str:
        """Get concise, non-repetitive answer."""
        docs: List[Document] = self.retriever.invoke(question)

        # Reuse the same, richer builder (no 'Document i' labels)
        context = truncate_documents(
            docs,
            max_context_tokens=settings.MAX_CONTEXT_TOKENS if hasattr(settings, "MAX_CONTEXT_TOKENS") else 2500,
            snippet_chars=600
        )

        concise_prompt = f"""Answer this question using only the provided context. Be clear and concise. Do not repeat information.

    Context: {context}

    Question: {question}

    Concise Answer:"""
        try:
            response = self.llm.invoke(concise_prompt)
            return response.content if hasattr(response, "content") else str(response)
        except Exception:
            return self.llm(concise_prompt)


    def debug_rag_response(self, question: str) -> str:
        """Debug: log relevance and show context preview with scores if available."""
        logger.info(f"🔍 Question: {question}")

        # Inspect vectorstore scores (pre-MQ/rerank) for diagnosis
        try:
            pairs = self.vectordb.similarity_search_with_relevance_scores(
                question, k=max(10, settings.RETRIEVAL_K * 2)
            )
            logger.info(f"\n📚 Retrieved {len(pairs)} candidates (vectorstore/scores)")
            for i, (doc, score) in enumerate(pairs):
                src = doc.metadata.get("source")
                title = doc.metadata.get("title")
                preview = doc.page_content[:160].replace("\n", " ")
                logger.info(f"{i+1:02d} score={score:.3f} source={src} title={title} :: {preview}")
        except Exception as e:
            logger.info(f"Score-based debug fallback: {e}")

        # Run the QA chain on the composed retriever
        result = self.qa.invoke({"query": question})
        answer = result["result"]
        logger.info(f"\n🤖 Comprehensive Answer:\n{answer}")
        return answer

# Global RAG engine instance
rag_engine = RAGEngine()
