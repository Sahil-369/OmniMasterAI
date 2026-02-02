
import React, { useState } from 'react';
import { supabaseService } from './supabaseService';

interface PaymentModalProps {
  userId: string;
  plan: { id: string; name: string; price: string; duration: string } | null;
  onClose: () => void;
  onSuccess: (planId: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ userId, plan, onClose, onSuccess }) => {
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'pay' | 'success'>('pay');

  const upiId = 'hindustanenterprises5054@oksbi';

  const handleSubmit = async () => {
    const tid = transactionId.trim();
    if (tid.length < 10) {
      setError("Transaction ID must be at least 10 characters long.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Update the payment ID in the database
      // Step 2: Check if payment ID is present (which it is here) and update premium to true
      const { error: updateError } = await supabaseService.updateProfile(userId, {
        paymentid: tid,
        premium: true 
      });

      if (updateError) throw updateError;
      
      setStep('success');
    } catch (err: any) {
      console.error("Payment Submission Error:", err);
      setError("Failed to process transaction. Please check your connection or ID.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(upiId);
    alert("UPI ID copied to clipboard!");
  };

  if (!plan) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black">Pay to Admin</h3>
            <p className="text-indigo-100 text-sm opacity-80">{plan.name} • {plan.price}</p>
          </div>
          {step !== 'success' && (
            <button onClick={onClose} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        <div className="p-8">
          {step === 'pay' ? (
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Scan or Pay via UPI</p>
                <div className="bg-white p-4 inline-block rounded-2xl border border-slate-200 mb-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={copyToClipboard}>
                  <p className="text-lg font-black text-indigo-600 break-all">{upiId}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Click to copy UPI ID</p>
                </div>
                <p className="text-sm text-slate-600 font-medium">Please pay the exact amount of <span className="text-indigo-600 font-black">{plan.price}</span> to the ID above.</p>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Transaction ID / Ref No.</span>
                  <input 
                    type="text" 
                    value={transactionId}
                    onChange={(e) => {
                      setTransactionId(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Enter 10+ character ID"
                    className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl outline-none font-bold transition-all ${error ? 'border-red-500' : 'border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600'}`}
                  />
                </label>

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-[10px] font-black rounded-xl animate-shake">
                    <i className="fas fa-exclamation-circle mr-2"></i> {error}
                  </div>
                )}

                <button 
                  disabled={isSubmitting || transactionId.trim().length < 10}
                  onClick={handleSubmit}
                  className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Submit & Unlock Mastery</span>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-slate-400 font-bold uppercase text-center leading-relaxed">
                Note: Access is granted immediately upon submission. Admin will verify the transaction ID manually. Providing a false ID will result in account suspension.
              </p>
            </div>
          ) : (
            <div className="py-10 text-center animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-8 shadow-xl shadow-green-100 animate-bounce">
                <i className="fas fa-check"></i>
              </div>
              <h4 className="text-3xl font-black text-slate-800 mb-2">Mastery Unlocked!</h4>
              <p className="text-slate-500 font-medium mb-10 leading-relaxed">Thank you for supporting OmniMaster AI. Your transaction ID has been logged for verification.</p>
              <button 
                onClick={() => onSuccess(plan.id)}
                className="w-full py-5 bg-green-500 text-white font-black rounded-3xl shadow-xl hover:bg-green-600 transition-all active:scale-95"
              >
                Enter Mastery Chamber
              </button>
            </div>
          )}
        </div>
        
        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
           <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
             Direct Admin Payment • 100% Secure Flow
           </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
