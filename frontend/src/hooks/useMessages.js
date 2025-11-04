import { useState, useEffect, useCallback } from 'react';

export const useMessages = (currentConversation, conversationMessages, user) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 🔹 Unique ID generator for messages
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  useEffect(() => {
    console.log("=== useMessages: Effect triggered ===");
    console.log("🗂 Current conversation:", currentConversation?.id);
    console.log("👤 Logged-in user:", user?.displayName);
    console.log("💬 Conversation keys:", Object.keys(conversationMessages || {}));

    // 🔹 1️⃣ If there’s a selected conversation
    if (currentConversation) {
      const cachedMessages = conversationMessages?.[currentConversation.id] || [];

      if (cachedMessages.length > 0) {
        console.log(`✅ Found ${cachedMessages.length} messages for conversation ${currentConversation.id}`);

        const formatted = cachedMessages.map((msg, index) => ({
          id: msg.id || `${msg.timestamp}_${index}` || generateMessageId(),
          type: msg.type,
          content: msg.content,
          sources: msg.sources || [],
          timestamp: new Date(msg.timestamp || msg.created_at || Date.now()),
        }));

        setMessages(formatted);
      } else {
        console.log("ℹ️ No cached messages found — showing personalized intro.");
        setMessages([
          {
            id: generateMessageId(),
            type: 'bot',
            content: user?.displayName
              ? `👋 Hi ${user.displayName}! I’m your AI research assistant. You can ask questions about the collected raw data or explore insights from your uploaded documents.`
              : `👋 Hello! I’m your AI research assistant. Please log in to personalize your experience.`,
            timestamp: new Date(),
          },
        ]);
      }
    }

    // 🔹 2️⃣ If there’s NO conversation selected yet
    else {
      console.log("ℹ️ No conversation selected — showing global welcome message.");
      if (user?.displayName) {
        setMessages([
          {
            id: generateMessageId(),
            type: 'bot',
            content: `Welcome ${user.displayName}! This AI system analyzes collected raw data for research purposes. What would you like to explore today?`,
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages([
          {
            id: generateMessageId(),
            type: 'bot',
            content: `Welcome! Please sign in to start exploring your data insights.`,
            timestamp: new Date(),
          },
        ]);
      }
    }
  }, [currentConversation, conversationMessages, generateMessageId, user]);

  // 🔹 Add new message dynamically
  const addMessage = useCallback(
    (message) => {
      const messageWithId = {
        ...message,
        id: message.id || generateMessageId(),
      };
      setMessages((prev) => [...prev, messageWithId]);
    },
    [generateMessageId]
  );

  // 🔹 Clear messages (reset)
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    addMessage,
    clearMessages,
    isLoading,
    setIsLoading,
  };
};
