import React from 'react';
import { MessageCircle } from 'lucide-react';

const MessageSources = ({ sources }) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 pt-3 border-t border-black/20">
      <p className="text-xs text-black mb-2 flex items-center font-medium">
        <MessageCircle className="w-3 h-3 mr-1 text-black" />
        Sources:
      </p>

      {sources.map((source, index) => (
        <div
          key={index}
          className="text-xs text-black bg-gray-100 rounded-lg p-2 mb-1 border border-gray-200 font-medium"
        >
          {source.document || source}
        </div>
      ))}
    </div>
  );
};

export default MessageSources;
