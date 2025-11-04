import React from "react";
import { Crown, MessageCircle, Zap, X } from "lucide-react";

const UpgradePrompt = ({ onClose }) => {
  const handleUpgrade = () => {
    const options = {
      key: "rzp_test_RYYc3rSYNvwjRx", // your Razorpay key
      amount: 49900, // amount in paise (49900 = ₹499)
      currency: "INR",
      name: "PunchBiz Premium",
      description: "Upgrade to Unlimited Chats",
      image: "https://your-logo-url.com/logo.png", // optional logo
      handler: function (response) {
        alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
        onClose();
      },
      prefill: {
        name: "Harish", // optional
        email: "user@example.com",
      },
      theme: {
        color: "#1E88E5",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  React.useEffect(() => {
    // ✅ Load Razorpay script dynamically
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-gradient-to-br from-[#E3F2FD]/90 via-[#BBDEFB]/90 to-[#90CAF9]/90 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl text-center relative animate-fade-in">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-black/70 hover:text-black transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-[#64B5F6] to-[#42A5F5] rounded-full flex items-center justify-center shadow-md">
            <Crown className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-2xl font-bold text-black mb-2">
            Upgrade to Premium
          </h3>

          <p className="text-black/70 mb-6">
            You’ve used all 3 free chats. Unlock unlimited conversations with
            our premium plan!
          </p>

          {/* Plans */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white/80 rounded-lg p-4 border border-black/10 shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <MessageCircle className="w-5 h-5 text-[#0288D1] mr-2" />
                <span className="text-black font-medium">Free Plan</span>
              </div>
              <div className="text-2xl font-bold text-black mb-1">3</div>
              <div className="text-black/60 text-sm">Chats per session</div>
            </div>

            <div className="bg-gradient-to-br from-[#90CAF9]/50 to-[#64B5F6]/50 rounded-lg p-4 border border-[#64B5F6]/70 shadow-md">
              <div className="flex items-center justify-center mb-2">
                <Crown className="w-5 h-5 text-yellow-500 mr-2" />
                <span className="text-black font-semibold">Premium</span>
              </div>
              <div className="flex items-center justify-center mb-1">
                <span className="text-3xl font-bold text-black">∞</span>
              </div>
              <div className="text-black/70 text-sm">Unlimited Chats</div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8 text-black">
            <div className="flex items-center justify-center">
              <Zap className="w-4 h-4 text-yellow-500 mr-2" />
              <span className="text-sm">Faster response times</span>
            </div>
            <div className="flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-[#0288D1] mr-2" />
              <span className="text-sm">Priority support</span>
            </div>
            <div className="flex items-center justify-center">
              <Crown className="w-4 h-4 text-[#007AFF] mr-2" />
              <span className="text-sm">Advanced AI features</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              className="w-full px-8 py-4 bg-gradient-to-r from-[#64B5F6] to-[#1E88E5] text-white font-semibold rounded-xl hover:from-[#42A5F5] hover:to-[#1976D2] transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Upgrade Premium
            </button>

            <button
              onClick={onClose}
              className="w-full px-8 py-3 bg-white/70 text-black font-medium rounded-xl hover:bg-white/90 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpgradePrompt;
