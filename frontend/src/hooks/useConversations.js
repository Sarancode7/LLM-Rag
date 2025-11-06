// hooks/useConversations.js
import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../utils/constants';

export const useConversations = (authHeaders, isAuthenticated) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Generate new conversation ID
  const generateConversationId = useCallback(() => {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Fetch user's conversation history (limit to 3)
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) {
      console.log("Not authenticated, skipping conversation fetch");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Fetching conversations from:", API_ENDPOINTS.CHAT_HISTORY);
      
      const response = await fetch(API_ENDPOINTS.CHAT_HISTORY, {
        headers: authHeaders()  // ✅ CALL as function, not spread
      });

      console.log("Conversations response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Conversations data received:", data);
        
        const limitedConversations = (data.conversations || []).slice(0, 3);
        setConversations(limitedConversations);
        console.log(`Set ${limitedConversations.length} conversations in state (limited to 3)`);
      } else {
        console.error('Failed to fetch conversations:', response.status);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, authHeaders]);

  const fetchConversationMessages = useCallback(async (conversationId) => {
    if (!isAuthenticated || !conversationId) return;

    try {
      const response = await fetch(
        `${API_ENDPOINTS.CONVERSATION_MESSAGES}/${conversationId}`,
        { headers: authHeaders() }  // ✅ CALL as function
      );

      if (response.ok) {
        const data = await response.json();
        setConversationMessages(prev => ({
          ...prev,
          [conversationId]: data.messages || []
        }));
        return data.messages || [];
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
    return [];
  }, [isAuthenticated, authHeaders]);

  const startNewConversation = useCallback(() => {
    const newConversationId = generateConversationId();
    const newConversation = {
      id: newConversationId,
      title: 'New Conversation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      message_count: 0
    };
    setCurrentConversation(newConversation);
    setConversationMessages(prev => ({
      ...prev,
      [newConversationId]: []
    }));
    return newConversationId;
  }, [generateConversationId]);

  const switchToConversation = useCallback((conversation) => {
    console.log("useConversations: Switching to conversation", conversation.id);
    setCurrentConversation(conversation);
  }, []);

  const addMessageToConversation = useCallback((conversationId, message) => {
    setConversationMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), message]
    }));
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { 
            ...conv, 
            updated_at: new Date().toISOString(),
            last_message: message.content.substring(0, 100),
            message_count: (conv.message_count || 0) + 1
          }
        : conv
    ));
  }, []);

  const deleteConversation = useCallback(async (conversationId) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.DELETE_CONVERSATION}/${conversationId}`,
        { method: 'DELETE', headers: authHeaders() }  // ✅ CALL as function
      );
      if (response.ok) {
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        delete conversationMessages[conversationId];
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(null);
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }, [authHeaders, conversationMessages, currentConversation]);

  const getCurrentMessages = useCallback(() => {
    if (!currentConversation) return [];
    return conversationMessages[currentConversation.id] || [];
  }, [currentConversation, conversationMessages]);

  // Load conversations when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    } else {
      setConversations([]);
      setCurrentConversation(null);
      setConversationMessages({});
    }
  }, [isAuthenticated, fetchConversations]);

  return {
    conversations,
    currentConversation,
    conversationMessages,
    isLoading,
    fetchConversations,
    fetchConversationMessages,
    startNewConversation,
    switchToConversation,
    addMessageToConversation,
    deleteConversation,
    getCurrentMessages,
    generateConversationId
  };
};
