import React, { useState, useEffect, useCallback } from 'react';
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
    setChatLimits,
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

  // ✅ Callback to update chat limits from backend response
  const handleChatLimitUpdate = useCallback((newRemaining, newUsed) => {
    console.log('Chat limit update received in App.jsx:', { 
      remaining: newRemaining, 
      used: newUsed 
    });
    
    setChatLimits({
      remaining: newRemaining,
      used: newUsed,
      canChat: newRemaining > 0
    });
  }, [setChatLimits]);

  const {
    sendMessage,
    apiEndpoint,
    setApiEndpoint
  } = useChatApi(
    addMessage, 
    setIsLoading, 
    getAuthHeaders(),
    addMessageToConversation,
    handleChatLimitUpdate
  );

  const {
    connectionStatus,
    lastError,
    testConnection
  } = useConnectionStatus(apiEndpoint);

  // ✅ NEW: Open upgrade modal (called by both Header and InputArea)
  const handleOpenUpgradeModal = () => {
    console.log('Opening upgrade modal...');
    setShowUpgradeModal(true);
  };

  // ✅ This function proceeds to payment after modal confirmation
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
      // ✅ Open modal instead of directly blocking
      handleOpenUpgradeModal();
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
            onOpenUpgradeModal={handleOpenUpgradeModal}  // ✅ Pass handler
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
        <Header
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={logout}
          sidePanelOpen={sidePanelOpen}
          setSidePanelOpen={setSidePanelOpen}
          onOpenUpgradeModal={handleOpenUpgradeModal}  // ✅ Pass handler
        />

        <MessageList messages={messages} isLoading={isLoading} user={user} />

        <InputArea
          onSendMessage={handleSendMessage}
          connectionStatus={connectionStatus}
          isLoading={isLoading}
          isAuthenticated={isAuthenticated}
          chatLimits={chatLimits}
          onOpenUpgradeModal={handleOpenUpgradeModal}  // ✅ Changed from onUpgrade
        />
      </div>

      {/* ✅ Modal controlled by App.jsx */}
      {showUpgradeModal && (
        <UpgradePrompt 
          onUpgrade={handleUpgrade}  // Go to payment
          onClose={handleCloseUpgradeModal}  // Close modal
        />
      )}
    </div>
  );
};

export default RAGChatbot;
