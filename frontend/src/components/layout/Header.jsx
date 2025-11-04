import React, { useState } from "react";
import { BookOpenText, Search, Crown, LogIn, Menu } from "lucide-react";
import UpgradePrompt from "../auth/UpgradePrompt";
import SidePanel from "../layout/SidePanel";

const Header = ({ isAuthenticated, user, onLogin, onLogout }) => {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <>
      {/* 🧭 Header Bar */}
      <header className="relative z-20 bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Left Section - Menu + Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPanelOpen(true)}
              className="p-2 rounded-lg hover:bg-white/20 transition"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>

            <div className="relative flex items-center justify-center p-2 rounded-xl bg-gradient-to-br from-[#5ac8fa] to-[#007aff] shadow-md">
              <BookOpenText className="w-5 h-5 text-white" />
              <Search className="w-3 h-3 text-white absolute -bottom-1 -right-1 opacity-90" />
            </div>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#5ac8fa] to-[#007aff] bg-clip-text text-transparent">
              DocReaderAI
            </h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowUpgrade(true)}
              className="flex items-center space-x-2 px-5 py-2 rounded-lg text-white text-sm font-medium shadow-sm 
                         bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                         transition-all duration-200 transform hover:scale-105"
            >
              <Crown className="w-4 h-4 text-yellow-300" />
              <span>Upgrade</span>
            </button>

            {isAuthenticated ? (
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-white/20 text-white/80 
                          hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <img
                  src={
                    user?.photoURL ||
                    "https://www.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png"
                  }
                  alt="User"
                  className="w-6 h-6 rounded-full"
                />
                <span>Logout</span>
              </button>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-white/20 text-white/80 
                          hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 🧩 Side Panel */}
      <SidePanel isOpen={isPanelOpen} setIsOpen={setIsPanelOpen} />

      {/* 💎 Upgrade Modal */}
      {showUpgrade && <UpgradePrompt onClose={() => setShowUpgrade(false)} />}
    </>
  );
};

export default Header;
