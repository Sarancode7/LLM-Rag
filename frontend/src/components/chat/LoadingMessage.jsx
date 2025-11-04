
import React from 'react';
import { Bot, Loader2 } from 'lucide-react';

const LoadingMessage = () => {
  return (
    <div className="flex items-start space-x-4">
      {/* Bot Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-[#81D4FA] to-[#0288D1] flex items-center justify-center shadow-md">
        <Bot className="w-5 h-5 text-white" />
      </div>

      {/* Loading Bubble */}
      <div className="flex-1">
        <div className="inline-block p-4 rounded-2xl bg-white/70 border border-black/10 shadow-md backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 animate-spin text-[#0288D1]" />
            <span className="text-black font-medium">AI is thinking...</span>

            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-[#0288D1] rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-[#4FC3F7] rounded-full animate-bounce"
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className="w-2 h-2 bg-[#81D4FA] rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;
