import React from "react";
import { MessageSquare, Trash2 } from "lucide-react";

const ChatHistory = ({ 
  conversations = [],
  currentConversation = null,
  onSelectConversation = null,
  onDeleteConversation = null,
  isLoading = false
}) => {
  console.log("🎯 ChatHistory Debug:", {
    conversationsArray: conversations,
    conversationsLength: conversations.length,
    isArray: Array.isArray(conversations),
    conversationsType: typeof conversations,
    firstConv: conversations[0]
  });

  if (isLoading) {
    return (
      <div className="text-center text-gray-500 py-6 px-3">
        <p className="animate-pulse">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.length === 0 ? (
        <div className="text-center text-gray-500 py-6 px-3">
          <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No conversations yet.</p>
          <p className="text-xs text-gray-400 mt-2">Click "New Chat" to start</p>
        </div>
      ) : (
        <div className="px-2">
          <p className="text-xs font-semibold text-gray-600 mb-2 px-1">
            Recent ({conversations.length})
          </p>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => {
                console.log("📌 Selecting conversation:", conv.id);
                if (onSelectConversation) {
                  onSelectConversation(conv);
                }
              }}
              className={`p-3 rounded-lg cursor-pointer transition-all group mb-2 flex items-start justify-between hover:bg-gray-100 ${
                currentConversation?.id === conv.id
                  ? "bg-blue-100 border border-blue-300"
                  : "border border-transparent hover:border-gray-200"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate line-clamp-2">
                  {conv.title || "Untitled Chat"}
                </p>
                <p className="text-xs text-gray-500 truncate mt-1 line-clamp-1">
                  {conv.last_message || "No messages yet"}
                </p>
                {conv.created_at && (
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(conv.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("🗑️ Deleting conversation:", conv.id);
                  if (onDeleteConversation && window.confirm("Delete this conversation?")) {
                    onDeleteConversation(conv.id);
                  }
                }}
                className="ml-2 p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                title="Delete conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
