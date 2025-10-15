// hooks/useMessages.js
import { useState, useEffect, useCallback } from 'react';

export const useMessages = (currentConversation, conversationMessages) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome_initial',
      type: 'bot',
      content: 'Hello! I\'m your AI-powered RAG chatbot. Ask me anything about your documents and I\'ll provide intelligent answers! ✨',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate unique ID for messages
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Load messages when conversation or conversationMessages changes
  useEffect(() => {
    console.log("=== useMessages: Effect triggered ===");
    console.log("  - Current conversation:", currentConversation?.id);
    console.log("  - All conversation messages keys:", Object.keys(conversationMessages || {}));
    
    if (currentConversation?.id) {
      const messagesForConv = conversationMessages?.[currentConversation.id];
      console.log(`  - Messages for current conversation (${currentConversation.id}):`, 
        messagesForConv?.length || 0);
    }
    
    if (currentConversation && conversationMessages && conversationMessages[currentConversation.id]) {
      const cachedMessages = conversationMessages[currentConversation.id];
      console.log(`useMessages: Found ${cachedMessages.length} messages for conversation ${currentConversation.id}`);
      
      if (cachedMessages.length > 0) {
        // Convert Firebase messages to UI format
        const formattedMessages = cachedMessages.map((msg, index) => {
          console.log(`  Processing message ${index}:`, msg.type, msg.content?.substring(0, 50));
          return {
            id: msg.id || `${msg.timestamp}_${index}` || generateMessageId(),
            type: msg.type,
            content: msg.content,
            sources: msg.sources || [],
            timestamp: new Date(msg.timestamp || msg.created_at || Date.now())
          };
        });

        console.log(`useMessages: Setting ${formattedMessages.length} formatted messages in UI`);
        setMessages(formattedMessages);
      } else {
        // Empty conversation - show welcome message
        console.log("useMessages: No messages in conversation, showing welcome");
        setMessages([{
          id: 'welcome_message',
          type: 'bot',
          content: 'Hello! I\'m your AI-powered RAG chatbot. Ask me anything about your documents and I\'ll provide intelligent answers! ✨',
          timestamp: new Date()
        }]);
      }
    } else if (!currentConversation) {
      // No conversation selected
      console.log("useMessages: No current conversation, showing welcome message");
      setMessages([{
        id: 'welcome_message_no_conv',
        type: 'bot',
        content: 'Hello! I\'m your AI-powered RAG chatbot. Ask me anything about your documents and I\'ll provide intelligent answers! ✨',
        timestamp: new Date()
      }]);
    } else {
      // Conversation selected but no messages cached yet
      console.log("useMessages: Conversation selected but no cached messages - waiting for fetch");
    }
  }, [currentConversation, conversationMessages, generateMessageId]);

  const addMessage = useCallback((message) => {
    const messageWithId = {
      ...message,
      id: message.id || generateMessageId()
    };
    setMessages(prev => [...prev, messageWithId]);
  }, [generateMessageId]);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: 'welcome_message_clear',
        type: 'bot',
        content: 'Hello! I\'m your AI-powered RAG chatbot. Ask me anything about your documents and I\'ll provide intelligent answers! ✨',
        timestamp: new Date()
      }
    ]);
  }, []);

  return {
    messages,
    addMessage,
    clearMessages,
    isLoading,
    setIsLoading
  };
};