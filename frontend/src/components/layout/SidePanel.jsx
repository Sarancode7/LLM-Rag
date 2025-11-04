import React from "react";
import {
  X,
  MessageSquarePlus,
  Search,
  Library,
  FolderPlus,
} from "lucide-react";
import ChatHistory from "../chat/ChatHistory";

const SidePanel = ({ isOpen, setIsOpen }) => {
  const togglePanel = () => setIsOpen(!isOpen);

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
                  className="w-5 h-5 mr-2 text-gray-700 cursor-pointer"
                />
              </span>
              <span>Menu</span>
            </h2>
          </div>

          {/* Top Menu Items */}
          <div className="flex flex-col p-4 space-y-3 text-gray-700">
            <button className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 transition-all">
              <MessageSquarePlus className="w-5 h-5" />
              <span>New Chat</span>
            </button>

            <button className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 transition-all">
              <Search className="w-5 h-5" />
              <span>Search Chats</span>
            </button>

            <button className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 transition-all">
              <Library className="w-5 h-5" />
              <span>Library</span>
            </button>

            <button className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 transition-all">
              <FolderPlus className="w-5 h-5" />
              <span>Projects</span>
            </button>
          </div>

          {/* Divider */}
          <div className="px-4 mt-2 text-gray-600 font-semibold text-sm">
            Chats
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto px-3 mt-2">
            <ChatHistory />
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
