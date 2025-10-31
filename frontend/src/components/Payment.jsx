import axios from "axios";
import React from "react";

const Payment = () => {
  const displayRazorpay = async () => {
    const loadScript = (src) => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const loaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!loaded) {
      alert("Razorpay SDK failed to load. Check your network.");
      return;
    }

    try {
      const { data: order } = await axios.post(
        "http://localhost:8000/api/payment/create-order",
        { amount: 499 }
      );

      console.log("✅ Order:", order);

      const options = {
        key: "rzp_test_RYYc3rSYNvwjRx",
        amount: order.amount,
        currency: order.currency,
        name: "Demo App",
        description: "Upgrade to Premium",
        order_id: order.order_id,
        handler: async function (response) {
          const verifyPayload = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };

          const verifyRes = await axios.post(
            "http://localhost:8000/api/payment/verify-payment",
            verifyPayload
          );

          alert(
            verifyRes.data.status === "success"
              ? "✅ Payment Success!"
              : "❌ Payment Failed!"
          );
        },
        theme: { color: "#3399cc" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error("Razorpay error:", err);
      alert("Something went wrong while starting the payment.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Pay ₹499</h2>
      <button
        onClick={displayRazorpay}
        style={{
          background: "#3399cc",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Pay Now
      </button>
    </div>
  );
};

export default Payment;
