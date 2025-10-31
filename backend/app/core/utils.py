# utils.py
import logging, re

logger = logging.getLogger(__name__)

_URL_RE = re.compile(r"(https?://\S+|www\.\S+)", re.IGNORECASE)
_FILE_RE = re.compile(r"\b[\w.-]+\.(txt|pdf|docx|html)\b", re.IGNORECASE)
_IDLIKE_RE = re.compile(r"\b[a-zA-Z]+[_-][a-zA-Z]+[_-]\d+\b")  # e.g., Language_nlp_61

def clean_repetitive_text(text: str) -> str:
    if not text:
        return text
    sentences = text.split(".")
    seen, out = set(), []
    for s in sentences:
        s = s.strip()
        if s and s not in seen:
            seen.add(s)
            out.append(s)
        elif len(out) > 5:
            break
    return (". ".join(out) + ("." if out else ""))

def count_tokens(text: str) -> int:
    return len(text) // 4

def _sanitize(text: str) -> str:
    if not text:
        return text
    text = _URL_RE.sub("", text)
    text = _FILE_RE.sub("", text)
    text = _IDLIKE_RE.sub("", text)
    return " ".join(text.split())

def truncate_documents(
    docs,
    max_context_tokens: int = 2500,
    snippet_chars: int = 600  # richer snippet like your pasted code
) -> str:
    """
    Build a clean, label-free context string by concatenating sanitized snippets.
    No 'Document i' prefixes; chunks are separated by a neutral divider.
    """
    parts, used = [], 0
    for doc in docs:
        content = (getattr(doc, "page_content", "") or "").strip()
        if not content:
            continue
        snippet = _sanitize(content[:snippet_chars])
        toks = count_tokens(snippet)
        if used + toks > max_context_tokens:
            break
        if snippet:
            parts.append(snippet)
            used += toks
    return "\n\n---\n\n".join(parts).strip()
