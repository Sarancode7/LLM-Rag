import React from "react";
import { MessageSquare } from "lucide-react";

const ChatHistory = ({ conversations = [] }) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md shadow-inner p-3">
      {conversations.length === 0 ? (
        <div className="text-center text-gray-500 py-6">
          <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No conversations yet.</p>
          <a
            href="#"
            className="text-blue-600 text-sm underline hover:text-blue-700"
          >
            Start your first conversation
          </a>
        </div>
      ) : (
        <ul className="space-y-2">
          {conversations.map((conv) => (
            <li
              key={conv.id}
              className="p-2 rounded-lg hover:bg-blue-50 cursor-pointer transition"
            >
              <p className="text-sm font-medium text-gray-800 truncate">
                {conv.title || "Untitled Chat"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {conv.last_message || "No messages yet"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatHistory;
