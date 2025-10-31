// App.jsx

import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import BackgroundElements from './components/layout/BackgroundElements';
import MessageList from './components/chat/MessageList';
import InputArea from './components/layout/InputArea';
import SidePanel from './components/layout/SidePanel';
import ChatHistory from './components/chat/ChatHistory';
import AuthInterface from './components/auth/AuthInterface';
import UpgradePrompt from './components/auth/UpgradePrompt';
import { useMessages } from './hooks/useMessages';
import { useChatApi } from './hooks/useChatApi';
import { useConnectionStatus } from './hooks/useConnectionStatus';
import { useAuth } from './hooks/useAuth';
import { useConversations } from './hooks/useConversations';
import Payment from './components/Payment';

const RAGChatbot = () => {
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false); // ✅ NEW STATE
  const [hasShownUpgradeModal, setHasShownUpgradeModal] = useState(false);
  // Auth hook
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    chatLimits,
    logout,
    getAuthHeaders,
    updateChatLimits
  } = useAuth();

  // Conversations hook
  const {
    conversations,
    currentConversation,
    conversationMessages,
    startNewConversation,
    switchToConversation,
    addMessageToConversation,
    deleteConversation,
    isLoading: conversationsLoading,
    fetchConversations,
    fetchConversationMessages
  } = useConversations(getAuthHeaders, isAuthenticated);

  // Load conversations when user becomes authenticated
 // ✅ Show upgrade modal when chat limits are reached
  useEffect(() => {
    if (isAuthenticated && chatLimits && !chatLimits.canChat && !hasShownUpgradeModal) {
      setShowUpgradeModal(true);
      setHasShownUpgradeModal(true);
    }
  }, [chatLimits, isAuthenticated, hasShownUpgradeModal]);

  const {
    messages,
    addMessage,
    clearMessages,
    isLoading,
    setIsLoading
  } = useMessages(currentConversation, conversationMessages);

  const {
    sendMessage,
    apiEndpoint,
    setApiEndpoint
  } = useChatApi(
    addMessage,
    setIsLoading,
    getAuthHeaders(),
    addMessageToConversation
  );

  const {
    connectionStatus,
    lastError,
    testConnection
  } = useConnectionStatus(apiEndpoint);


  // Handle upgrade prompt
  const handleUpgrade = () => {
    setShowUpgradeModal(false);
    setShowPayment(true);
  };

  const handleCloseUpgradeModal = () => {
    setShowUpgradeModal(false);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    // Update chat limits or user status here
    alert('Payment successful! You now have unlimited chats.');
  };

  const handlePaymentBack = () => {
    setShowPayment(false);
  };

  if (showPayment) {
    return (
      <Payment 
        onBack={handlePaymentBack}
        onSuccess={handlePaymentSuccess}
      />
    );
  }

  // Enhanced send message with chat history
  const handleSendMessage = async (messageContent) => {
    if (!isAuthenticated) {
      const errorMsg = {
        id: Date.now(),
        type: 'bot',
        content: 'Please log in with Google to start chatting.',
        timestamp: new Date(),
        isError: true
      };
      addMessage(errorMsg);
      return;
    }

    if (!chatLimits.canChat) {
      setShowUpgradeModal(true); // ✅ Show modal instead of blocking
      return;
    }

    // If no current conversation, start a new one
    let conversationId = currentConversation?.id;
    if (!conversationId) {
      conversationId = startNewConversation();
    }

    try {
      const userMessage = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'user',
        content: messageContent,
        timestamp: new Date()
      };

      // Add to local state immediately
      addMessage(userMessage);

      // Add to conversation (optimistic update)
      addMessageToConversation(conversationId, {
        type: 'user',
        content: messageContent,
        timestamp: new Date().toISOString()
      });

      // Send to backend with conversation ID
      await sendMessage(messageContent, conversationId);

      // Update chat limits
      updateChatLimits(chatLimits.remaining - 1);
    } catch (error) {
      console.error('Message send error:', error);
    }
  };

  // Handle conversation selection
  const handleSelectConversation = async (conversation) => {
    console.log('SELECTING CONVERSATION:', conversation);
    
    try {
      switchToConversation(conversation);
      console.log('Fetching messages for conversation:', conversation.id);
      const fetchedMessages = await fetchConversationMessages(conversation.id);
      console.log('Fetched messages:', fetchedMessages);
      
      if (fetchedMessages && fetchedMessages.length > 0) {
        console.log(`Successfully loaded ${fetchedMessages.length} messages`);
      } else {
        console.log('No messages found for this conversation');
      }
    } catch (error) {
      console.error('Error selecting conversation:', error);
    }
  };

  // Handle new conversation
  const handleNewConversation = () => {
    const newConvId = startNewConversation();
    clearMessages();
  };

  // Handle conversation deletion
  const handleDeleteConversation = async (conversationId) => {
    await deleteConversation(conversationId);
    if (currentConversation?.id === conversationId) {
      clearMessages();
    }
  };

  // If not authenticated, show login interface
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
        <BackgroundElements />
        <div className="flex flex-col flex-1">
          <Header 
            connectionStatus={connectionStatus}
            lastError={lastError}
            clearChat={clearMessages}
            apiEndpoint={apiEndpoint}
            setApiEndpoint={setApiEndpoint}
            testConnection={testConnection}
            user={user}
            isAuthenticated={isAuthenticated}
            authLoading={authLoading}
            chatLimits={chatLimits}
            onLogout={logout}
            showChatHistory={showChatHistory}
            setShowChatHistory={setShowChatHistory}
          />
          <div className="flex-1 flex items-center justify-center">
            <AuthInterface 
              user={user}
              isAuthenticated={isAuthenticated}
              isLoading={authLoading}
              chatLimits={chatLimits}
              onLogout={logout}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      <BackgroundElements />
      
      {/* Chat History Sidebar */}
      {showChatHistory && (
        <ChatHistory 
          conversations={conversations}
          currentConversation={currentConversation}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          isLoading={conversationsLoading}
        />
      )}

      {/* Domain Panel */}
      <SidePanel 
        isOpen={sidePanelOpen}
        setIsOpen={setSidePanelOpen}
      />

      {/* Main Content */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${
        sidePanelOpen ? 'lg:ml-80 ml-0' : ''
      } ${showChatHistory ? 'ml-80' : ''}`}>
        <Header 
          connectionStatus={connectionStatus}
          lastError={lastError}
          clearChat={handleNewConversation}
          apiEndpoint={apiEndpoint}
          setApiEndpoint={setApiEndpoint}
          testConnection={testConnection}
          user={user}
          isAuthenticated={isAuthenticated}
          authLoading={authLoading}
          chatLimits={chatLimits}
          onLogout={logout}
          showChatHistory={showChatHistory}
          setShowChatHistory={setShowChatHistory}
          currentConversation={currentConversation}
        />
        
        <MessageList 
          messages={messages}
          isLoading={isLoading}
        />
        
        <InputArea 
          onSendMessage={handleSendMessage}
          connectionStatus={connectionStatus}
          isLoading={isLoading}
          isAuthenticated={isAuthenticated}
          chatLimits={chatLimits}
          onUpgrade={handleUpgrade}  // ✅ MAKE SURE THIS IS HERE
        />

      </div>

      {/* ✅ Upgrade Modal Overlay */}
      {showUpgradeModal && (
        <UpgradePrompt 
          onUpgrade={handleUpgrade}
          onClose={handleCloseUpgradeModal}
        />
      )}
    </div>
  );
};

export default RAGChatbot;
