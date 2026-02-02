
import React, { useState } from 'react';

interface DailyRewardModalProps {
  streak: number;
  onClaim: () => void;
}

const DailyRewardModal: React.FC<DailyRewardModalProps> = ({ streak, onClaim }) => {
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = () => {
    setIsClaiming(true);
    setTimeout(() => {
      onClaim();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl p-6">
      <div className="max-w-md w-full bg-white rounded-[48px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="relative h-48 bg-indigo-600 flex items-center justify-center overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-20">
             <div className="absolute top-0 left-0 w-24 h-24 bg-white rounded-full -translate-x-12 -translate-y-12"></div>
             <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16"></div>
          </div>
          
          <div className="relative z-10 text-center text-white">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/30 transform -rotate-6">
              <i className="fas fa-gift text-4xl"></i>
            </div>
            <h3 className="text-2xl font-black">Daily Mastery Bonus</h3>
          </div>
        </div>

        <div className="p-10 text-center">
          <div className="mb-8">
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mb-2">Current Streak</p>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-5xl font-black text-slate-900">{streak + 1}</span>
              <span className="text-2xl text-orange-500"><i className="fas fa-fire"></i></span>
            </div>
            <p className="text-slate-500 font-medium mt-2">You're on fire! Keep the momentum going.</p>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-10">
            <h4 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-widest">Today's Rewards</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-xs">
                    <i className="fas fa-plus"></i>
                  </div>
                  <span className="text-sm font-bold text-slate-700">1 Bonus Free Topic</span>
                </div>
                <span className="text-[10px] font-black text-indigo-600 uppercase">Unlocked</span>
              </div>
              <div className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-xs">
                    <i className="fas fa-star"></i>
                  </div>
                  <span className="text-sm font-bold text-slate-700">10 Mastery Points</span>
                </div>
                <span className="text-[10px] font-black text-amber-600 uppercase">Earned</span>
              </div>
            </div>
          </div>

          <button 
            disabled={isClaiming}
            onClick={handleClaim}
            className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-3"
          >
            {isClaiming ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Securing Rewards...</span>
              </>
            ) : (
              <>
                <i className="fas fa-check-circle"></i>
                <span>Claim Rewards</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyRewardModal;
