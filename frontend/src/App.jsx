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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    chatLimits,
    logout,
    getAuthHeaders,
    updateChatLimits
  } = useAuth();

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

  const {
    messages,
    addMessage,
    clearMessages,
    isLoading,
    setIsLoading
  } = useMessages(currentConversation, conversationMessages);

  // ✅ FIX: Pass getAuthHeaders function, not the result of calling it
  const {
    sendMessage,
    apiEndpoint,
    setApiEndpoint
  } = useChatApi(addMessage, setIsLoading, getAuthHeaders, addMessageToConversation);

  const {
    connectionStatus,
    lastError,
    testConnection
  } = useConnectionStatus(apiEndpoint);

  const handleUpgrade = () => {
    setShowUpgradeModal(false);
    setShowPayment(true);
  };

  const handleCloseUpgradeModal = () => setShowUpgradeModal(false);

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    alert('Payment successful! You now have unlimited chats.');
  };

  const handlePaymentBack = () => setShowPayment(false);

  if (showPayment) {
    return (
      <Payment onBack={handlePaymentBack} onSuccess={handlePaymentSuccess} />
    );
  }

  const handleSendMessage = async (messageContent) => {
    if (!isAuthenticated) {
      addMessage({
        id: Date.now(),
        type: 'bot',
        content: 'Please log in with Google to start chatting.',
        timestamp: new Date(),
        isError: true
      });
      return;
    }

    if (chatLimits && !chatLimits.canChat) {
      setShowUpgradeModal(true);
      return;
    }

    let conversationId = currentConversation?.id || startNewConversation();

    try {
      const userMessage = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'user',
        content: messageContent,
        timestamp: new Date()
      };
      addMessage(userMessage);
      addMessageToConversation(conversationId, {
        type: 'user',
        content: messageContent,
        timestamp: new Date().toISOString()
      });
      await sendMessage(messageContent, conversationId);
      updateChatLimits(chatLimits.remaining - 1);
    } catch (error) {
      console.error('Message send error:', error);
    }
  };

  const handleSelectConversation = async (conversation) => {
    try {
      switchToConversation(conversation);
      await fetchConversationMessages(conversation.id);
    } catch (error) {
      console.error('Error selecting conversation:', error);
    }
  };

  const handleNewConversation = () => {
    startNewConversation();
    clearMessages();
  };

  const handleDeleteConversation = async (conversationId) => {
    await deleteConversation(conversationId);
    if (currentConversation?.id === conversationId) clearMessages();
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
        <BackgroundElements />
        <div className="flex flex-col flex-1">
          <Header
            isAuthenticated={isAuthenticated}
            user={user}
            onLogout={logout}
            sidePanelOpen={sidePanelOpen}
            setSidePanelOpen={setSidePanelOpen}
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

      {/* ✅ Main SidePanel with Conversations */}
      <SidePanel 
        isOpen={sidePanelOpen} 
        setIsOpen={setSidePanelOpen}
        conversations={conversations}
        currentConversation={currentConversation}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        isLoading={conversationsLoading}
      />

      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          sidePanelOpen ? 'lg:ml-80 ml-0' : ''
        } ${showChatHistory ? 'ml-80' : ''}`}
      >
        {/* ✅ Updated Header with sidePanelOpen props */}
        <Header
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={logout}
          sidePanelOpen={sidePanelOpen}
          setSidePanelOpen={setSidePanelOpen}
        />

        <MessageList messages={messages} isLoading={isLoading} user={user} />

        <InputArea
          onSendMessage={handleSendMessage}
          connectionStatus={connectionStatus}
          isLoading={isLoading}
          isAuthenticated={isAuthenticated}
          chatLimits={chatLimits}
          onUpgrade={handleUpgrade}
        />
      </div>

      {showUpgradeModal && (
        <UpgradePrompt onUpgrade={handleUpgrade} onClose={handleCloseUpgradeModal} />
      )}
    </div>
  );
};

export default RAGChatbot;
