// src/components/payment/Payment.jsx
import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Smartphone, Building2, CheckCircle2, Lock } from 'lucide-react';

const Payment = ({ onBack, onSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    // Card details
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    // UPI details
    upiId: '',
    // Net Banking
    bankName: ''
  });
  const [errors, setErrors] = useState({});

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g);
    return formatted ? formatted.join(' ') : cleaned;
  };

  // Format expiry date
  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  // Validate card number using Luhn algorithm
  const validateCardNumber = (number) => {
    const cleaned = number.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  // Detect card type
  const getCardType = (number) => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'American Express';
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value.replace(/\s/g, '').slice(0, 16));
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value.slice(0, 5));
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (name === 'cardName') {
      formattedValue = value.replace(/[^a-zA-Z\s]/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (selectedMethod === 'card') {
      if (!formData.cardNumber || !validateCardNumber(formData.cardNumber)) {
        newErrors.cardNumber = 'Invalid card number';
      }
      if (!formData.cardName || formData.cardName.length < 3) {
        newErrors.cardName = 'Cardholder name is required';
      }
      if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Invalid expiry date (MM/YY)';
      }
      if (!formData.cvv || formData.cvv.length < 3) {
        newErrors.cvv = 'Invalid CVV';
      }
    } else if (selectedMethod === 'upi') {
      if (!formData.upiId || !/^[\w.-]+@[\w.-]+$/.test(formData.upiId)) {
        newErrors.upiId = 'Invalid UPI ID';
      }
    } else if (selectedMethod === 'netbanking') {
      if (!formData.bankName) {
        newErrors.bankName = 'Please select a bank';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      if (onSuccess) {
        onSuccess();
      }
    }, 2000);
  };

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
    { id: 'upi', name: 'UPI', icon: Smartphone },
    { id: 'netbanking', name: 'Net Banking', icon: Building2 }
  ];

  const popularBanks = [
    'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
    'Punjab National Bank', 'Bank of Baroda', 'Kotak Mahindra Bank', 'IndusInd Bank'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Upgrade to Premium
          </h1>
          <p className="text-white/70">
            Complete your payment to unlock unlimited conversations
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Payment Methods and Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Select Payment Method</h2>
              <div className="grid grid-cols-3 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedMethod === method.id
                          ? 'border-purple-400 bg-purple-500/20'
                          : 'border-white/20 bg-white/5 hover:border-white/40'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${
                        selectedMethod === method.id ? 'text-purple-300' : 'text-white/60'
                      }`} />
                      <span className={`text-sm ${
                        selectedMethod === method.id ? 'text-white' : 'text-white/60'
                      }`}>
                        {method.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <form onSubmit={handleSubmit} className="space-y-4">
                {selectedMethod === 'card' && (
                  <>
                    <div>
                      <label className="block text-white mb-2 text-sm font-medium">
                        Card Number
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
                          errors.cardNumber ? 'border-red-400' : 'border-white/20'
                        } text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-colors`}
                      />
                      {errors.cardNumber && (
                        <p className="text-red-400 text-sm mt-1">{errors.cardNumber}</p>
                      )}
                      {formData.cardNumber && !errors.cardNumber && (
                        <p className="text-purple-300 text-sm mt-1">
                          {getCardType(formData.cardNumber)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-white mb-2 text-sm font-medium">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
                          errors.cardName ? 'border-red-400' : 'border-white/20'
                        } text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-colors`}
                      />
                      {errors.cardName && (
                        <p className="text-red-400 text-sm mt-1">{errors.cardName}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white mb-2 text-sm font-medium">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
                            errors.expiryDate ? 'border-red-400' : 'border-white/20'
                          } text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-colors`}
                        />
                        {errors.expiryDate && (
                          <p className="text-red-400 text-sm mt-1">{errors.expiryDate}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-white mb-2 text-sm font-medium">
                          CVV
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
                            errors.cvv ? 'border-red-400' : 'border-white/20'
                          } text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-colors`}
                        />
                        {errors.cvv && (
                          <p className="text-red-400 text-sm mt-1">{errors.cvv}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {selectedMethod === 'upi' && (
                  <div>
                    <label className="block text-white mb-2 text-sm font-medium">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      name="upiId"
                      value={formData.upiId}
                      onChange={handleInputChange}
                      placeholder="yourname@upi"
                      className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
                        errors.upiId ? 'border-red-400' : 'border-white/20'
                      } text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-colors`}
                    />
                    {errors.upiId && (
                      <p className="text-red-400 text-sm mt-1">{errors.upiId}</p>
                    )}
                    <p className="text-white/60 text-sm mt-2">
                      Enter your UPI ID (Google Pay, PhonePe, Paytm, etc.)
                    </p>
                  </div>
                )}

                {selectedMethod === 'netbanking' && (
                  <div>
                    <label className="block text-white mb-2 text-sm font-medium">
                      Select Your Bank
                    </label>
                    <select
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
                        errors.bankName ? 'border-red-400' : 'border-white/20'
                      } text-white focus:outline-none focus:border-purple-400 transition-colors`}
                    >
                      <option value="" className="bg-purple-900">Select a bank</option>
                      {popularBanks.map((bank) => (
                        <option key={bank} value={bank} className="bg-purple-900">
                          {bank}
                        </option>
                      ))}
                    </select>
                    {errors.bankName && (
                      <p className="text-red-400 text-sm mt-1">{errors.bankName}</p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {processing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Pay ₹499'
                  )}
                </button>

                <div className="flex items-center justify-center text-white/60 text-sm mt-4">
                  <Lock className="w-4 h-4 mr-2" />
                  <span>Secure payment powered by 256-bit SSL encryption</span>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 sticky top-8">
              <h3 className="text-xl font-semibold text-white mb-4">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-white/80">
                  <span>Premium Plan (Monthly)</span>
                  <span>₹499</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>GST (18%)</span>
                  <span>₹90</span>
                </div>
                <div className="border-t border-white/20 pt-4 flex justify-between text-white font-semibold text-lg">
                  <span>Total</span>
                  <span>₹589</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start text-white/70 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Unlimited conversations</span>
                </div>
                <div className="flex items-start text-white/70 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-start text-white/70 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Advanced AI features</span>
                </div>
                <div className="flex items-start text-white/70 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Cancel anytime</span>
                </div>
              </div>

              <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-400/30">
                <p className="text-white/90 text-sm">
                  <strong>Note:</strong> Your subscription will auto-renew monthly. You can cancel anytime from your account settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
