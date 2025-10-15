# app/main.py
from fastapi import FastAPI, Depends
import uvicorn
import logging

from app.config.settings import settings
from app.middleware.cors import add_cors_middleware
from app.models.schemas import (
    ChatRequest, ChatResponse, GoogleTokenRequest, AuthResponse, UserInfo
)
from app.api.endpoints import (
    # Existing endpoints
    health_check, chat, debug_question, concise_chat,
    # New auth endpoints
    google_login, get_user_status, check_chat_limits, upgrade_placeholder,
    # New chat history endpoints
    get_chat_history, get_conversation_messages, delete_conversation
)
from app.core.rag_engine import rag_engine
from app.core.auth import get_current_user, check_chat_limit
from app.core.firebase_service import firebase_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title=settings.TITLE, version=settings.VERSION)

# Add middleware
add_cors_middleware(app)

# Event handlers
@app.on_event("startup")
async def startup_event():
    """Initialize RAG and Firebase on startup"""
    # Initialize Firebase first
    firebase_initialized = firebase_service.initialize()
    if not firebase_initialized:
        logger.warning("Firebase initialization failed - running without persistent storage")
    
    # Initialize RAG
    rag_engine.initialize()
    logger.info("Application startup complete")

# Health Routes
@app.get("/health")
async def health_endpoint():
    return await health_check()

# Authentication Routes
@app.post("/auth/google", response_model=AuthResponse)
async def google_login_endpoint(request: GoogleTokenRequest):
    return await google_login(request)

@app.get("/auth/me")
async def get_user_endpoint(current_user: UserInfo = Depends(get_current_user)):
    return await get_user_status(current_user)

@app.get("/auth/limits")
async def check_limits_endpoint(current_user: UserInfo = Depends(get_current_user)):
    return await check_chat_limits(current_user)

@app.get("/auth/upgrade")
async def upgrade_endpoint():
    return await upgrade_placeholder()

# Chat Routes (now protected)
@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, current_user: UserInfo = Depends(check_chat_limit)):
    return await chat(request, current_user)

@app.post("/debug")
async def debug_endpoint(request: ChatRequest, current_user: UserInfo = Depends(get_current_user)):
    return await debug_question(request, current_user)

@app.post("/concise")
async def concise_endpoint(request: ChatRequest, current_user: UserInfo = Depends(check_chat_limit)):
    return await concise_chat(request, current_user)

# routes for chat history
@app.get("/history")
async def history_endpoint(current_user: UserInfo = Depends(get_current_user)):
    return await get_chat_history(current_user)

@app.get("/conversation/{conversation_id}")
async def conversation_endpoint(conversation_id: str, current_user: UserInfo = Depends(get_current_user)):
    return await get_conversation_messages(conversation_id, current_user)

@app.delete("/conversation/{conversation_id}")
async def delete_conversation_endpoint(conversation_id: str, current_user: UserInfo = Depends(get_current_user)):
    return await delete_conversation(conversation_id, current_user)

@app.get("/test/conversations/{user_id}")
async def test_conversations(user_id: str):
    """Test route to check if conversations are being saved"""
    try:
        conversations = firebase_service.get_user_conversations(user_id)
        return {
            "user_id": user_id,
            "conversation_count": len(conversations),
            "conversations": conversations,
            "firebase_initialized": firebase_service.initialized
        }
    except Exception as e:
        return {
            "error": str(e),
            "firebase_initialized": firebase_service.initialized
        }
@app.get("/test/conversations/{user_id}")
async def test_conversations(user_id: str):
    """Test route to check if conversations are being saved"""
    try:
        conversations = firebase_service.get_user_conversations(user_id)
        return {
            "user_id": user_id,
            "conversation_count": len(conversations),
            "conversations": conversations,
            "firebase_initialized": firebase_service.initialized
        }
    except Exception as e:
        return {
            "error": str(e),
            "firebase_initialized": firebase_service.initialized
        }

@app.get("/debug/conversations/{user_id}")
async def debug_conversations_endpoint(user_id: str):
    """Debug route to see what's in the database"""
    try:
        debug_info = firebase_service.debug_conversations(user_id)
        return debug_info
    except Exception as e:
        return {"error": str(e)}

@app.get("/test/messages/{conversation_id}")
async def test_messages(conversation_id: str):
    """Test route to check if messages are saved"""
    try:
        messages = firebase_service.get_conversation_messages(conversation_id)
        return {
            "conversation_id": conversation_id,
            "message_count": len(messages),
            "messages": messages,
            "firebase_initialized": firebase_service.initialized
        }
    except Exception as e:
        return {
            "error": str(e),
            "conversation_id": conversation_id,
            "firebase_initialized": firebase_service.initialized
        }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)