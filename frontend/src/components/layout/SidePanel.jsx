import React from "react";
import { X, MessageSquarePlus, Search, Trash2 } from "lucide-react";

const SidePanel = ({ 
  isOpen, 
  setIsOpen,
  conversations = [],
  currentConversation = null,
  onSelectConversation = null,
  onNewConversation = null,
  onDeleteConversation = null,
  isLoading = false
}) => {
  const togglePanel = () => setIsOpen(!isOpen);

  const handleNewChat = () => {
    console.log("✅ New Chat clicked!");
    if (onNewConversation) {
      onNewConversation();
    }
  };

  const handleSelectConversation = (conversation) => {
    console.log("📌 SidePanel: Selecting conversation:", conversation.id);
    if (onSelectConversation) {
      onSelectConversation(conversation);
    }
  };

  return (
    <>
      {/* Side Panel */}
      <div
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-30 shadow-lg 
        ${isOpen ? "w-72 translate-x-0" : "w-0 -translate-x-full"} overflow-hidden`}
      >
        <div className="flex flex-col h-full w-72">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <span className="flex items-center">
                <X
                  onClick={togglePanel}
                  className="w-5 h-5 mr-2 text-gray-700 cursor-pointer hover:text-gray-900 transition"
                />
              </span>
              <span>Menu</span>
            </h2>
          </div>

          {/* Top Menu Items */}
          <div className="flex flex-col p-4 space-y-3 text-gray-700">
            <button 
              onClick={handleNewChat}
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-blue-100 transition-all bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200"
            >
              <MessageSquarePlus className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-700">New Chat</span>
            </button>

            <button className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 transition-all">
              <Search className="w-5 h-5" />
              <span>Search Chats</span>
            </button>
          </div>

          {/* Divider */}
          <div className="px-4 mt-4 text-gray-600 font-semibold text-sm">
            Chats
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto px-3 mt-2">
            {isLoading ? (
              <div className="p-3 text-center text-gray-500">
                <p className="text-sm animate-pulse">Loading conversations...</p>
              </div>
            ) : !conversations || conversations.length === 0 ? (
              <div className="text-center text-gray-500 py-6 px-3">
                <p className="text-sm">No conversations yet.</p>
                <p className="text-xs text-gray-400 mt-2">Click "New Chat" to start</p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2 px-1">
                  Recent ({conversations.length})
                </p>
                {conversations.map((conv, idx) => (
                  <div
                    key={conv.id || idx}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-3 rounded-lg cursor-pointer transition-all group mb-2 flex items-start justify-between ${
                      currentConversation?.id === conv.id
                        ? "bg-blue-100 border border-blue-300"
                        : "hover:bg-gray-100 border border-transparent"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {conv.title || "Untitled Chat"}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {conv.last_message || "No messages yet"}
                      </p>
                      {conv.created_at && (
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(conv.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 text-center">
            RAG Chatbot v1.0.0
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20"
          onClick={togglePanel}
        />
      )}
    </>
  );
};

export default SidePanel;
