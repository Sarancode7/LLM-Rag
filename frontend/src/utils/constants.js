// utils/constants.js
const BACKEND_URL = 'http://localhost:8000'
//'http://15.206.68.175:8000';

export const API_ENDPOINTS = {
  CHAT: `${BACKEND_URL}/chat`,                    
  HEALTH: `${BACKEND_URL}/health`,                
  DEBUG: `${BACKEND_URL}/debug`,                  
  CONCISE: `${BACKEND_URL}/concise`,             
  
  // Auth endpoints
  GOOGLE_LOGIN: `${BACKEND_URL}/auth/google`,     
  USER_ME: `${BACKEND_URL}/auth/me`,              
  CHAT_LIMITS: `${BACKEND_URL}/auth/limits`,      
  UPGRADE: `${BACKEND_URL}/auth/upgrade`,         
  
  // Chat history endpoints
  CHAT_HISTORY: `${BACKEND_URL}/history`,                      
  CONVERSATION_MESSAGES: `${BACKEND_URL}/conversation`,        
  DELETE_CONVERSATION: `${BACKEND_URL}/conversation`           
};

export const CONNECTION_STATUS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
  CONNECTING: 'connecting'
};

export const MESSAGE_TYPES = {
  USER: 'user',
  BOT: 'bot'
};

export const TIMEOUTS = {
  CONNECTION_TEST: 10000,
  CHAT_REQUEST: 60000,
  AUTO_RETRY: 30000
};

export const LIMITS = {
  MESSAGE_MAX_LENGTH: 1000,
  TEXTAREA_MAX_HEIGHT: '120px',
  TEXTAREA_MIN_HEIGHT: '56px',
  FREE_CHAT_LIMIT: 3
};

// Google OAuth Configuration
export const GOOGLE_CONFIG = {
  CLIENT_ID: '2574307330-5adorlgn33m7imegppok04bjdp9dkn4e.apps.googleusercontent.com',
  REDIRECT_URI: window.location.origin,
  SCOPE: 'openid email profile'
};
