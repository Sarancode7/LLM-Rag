import React, { useRef, useEffect } from "react";
import Message from "./Message";
import LoadingMessage from "./LoadingMessage";

const MessageList = ({ messages = [], isLoading, user }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Detect if only welcome-type message is present
  const onlyWelcome =
    messages.length === 1 &&
    messages[0].type === "bot" &&
    /welcome|hello|hi/i.test(messages[0].content);

  // ✅ Safely extract user's name
  const userName =
    user?.displayName?.trim() ||
    user?.email?.split("@")[0] ||
    "there";

  return (
    <div className="flex-1 overflow-y-auto p-6 relative z-10">
      <div className="max-w-4xl mx-auto space-y-6 text-black">
        {/* ✅ Center greeting if only welcome message exists */}
        {onlyWelcome ? (
          <div className="flex flex-col items-center justify-center text-center mt-40">
            {userName ? (
              <>
                <h2 className="text-3xl font-semibold mb-2 drop-shadow-sm text-black">
                  Hello {userName} 👋
                </h2>
                <p className="text-lg text-black/90">
                  Start exploring your data insights.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-semibold mb-2 drop-shadow-sm text-black">
                  Welcome!
                </h2>
                <p className="text-lg text-black/90">
                  Please sign in to start exploring your data insights.
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            {/* ✅ Render all messages with black text */}
            {messages.map((message) => (
              <div key={message.id} className="text-black">
                <Message message={message} />
              </div>
            ))}

            {/* ✅ Loading indicator */}
            {isLoading && <LoadingMessage />}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
};

export default MessageList;
