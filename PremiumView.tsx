
import React from 'react';

interface PremiumViewProps {
  isPremium: boolean;
  onUpgrade: () => void;
  onBack: () => void;
}

const PremiumView: React.FC<PremiumViewProps> = ({ isPremium, onUpgrade, onBack }) => {
  const benefits = [
    { title: 'Unlimited Mastery Roadmaps', desc: 'Create infinite learning paths for any subject, skill, or hobby.', icon: 'fa-infinity', color: 'text-purple-500' },
    { title: 'Verified Mastery Badge', desc: 'Stand out on the global leaderboard with a blue verification check.', icon: 'fa-check-circle', color: 'text-blue-500' },
    { title: 'Priority AI Architecture', desc: 'Faster generation of roadmaps and deep-dive lessons.', icon: 'fa-bolt', color: 'text-amber-500' },
    { title: 'Ad-Free Learning', desc: 'Remove all banner advertisements for a distraction-free journey.', icon: 'fa-ban', color: 'text-rose-500' },
    { title: 'Cloud Mastery Sync', desc: 'Your progress is backed up to the cloud instantly and securely.', icon: 'fa-cloud-upload-alt', color: 'text-indigo-500' },
    { title: 'Unlimited AI Chat', desc: 'Talk to Omni without daily limits or cooling-off periods.', icon: 'fa-comment-dots', color: 'text-emerald-500' }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-12 lg:p-16">
      <div className="max-w-4xl mx-auto space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-8 duration-500">
        
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 font-bold hover:text-indigo-600 transition-colors"
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Dashboard
        </button>

        {/* Hero Section */}
        <div className="relative bg-white p-10 md:p-16 rounded-[48px] shadow-sm border border-slate-100 overflow-hidden text-center">
           {/* Decorative Background */}
           <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
             <i className="fas fa-crown text-[200px]"></i>
           </div>
           
           <div className="relative z-10">
              <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8 shadow-lg shadow-amber-100 transform -rotate-6">
                <i className="fas fa-crown"></i>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                {isPremium ? 'Welcome to Master Tier' : 'Upgrade to Master Tier'}
              </h1>
              <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-10">
                {isPremium 
                  ? 'You have unlocked the full potential of AI-driven learning. Your journey to polymathy has no limits.' 
                  : 'Master every subject with unlimited access, zero distractions, and priority AI architecture.'}
              </p>
              
              {!isPremium && (
                <div className="space-y-4">
                   <button 
                     onClick={onUpgrade}
                     className="px-12 py-6 bg-amber-500 text-white font-black rounded-3xl shadow-2xl shadow-amber-100 hover:bg-amber-600 transition-all transform active:scale-95 text-xl"
                   >
                     Unlock Lifetime Access • ₹99
                   </button>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">One-time payment • No monthly recurring fees</p>
                </div>
              )}
              
              {isPremium && (
                <div className="inline-flex items-center space-x-3 px-8 py-4 bg-green-500 text-white rounded-2xl font-black shadow-xl">
                  <i className="fas fa-check-double"></i>
                  <span>Active Lifetime Membership</span>
                </div>
              )}
           </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 group hover:shadow-xl transition-all">
              <div className={`w-12 h-12 bg-slate-50 ${benefit.color} rounded-2xl flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform`}>
                <i className={`fas ${benefit.icon}`}></i>
              </div>
              <h4 className="text-lg font-black text-slate-800 mb-2">{benefit.title}</h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>

        {/* Comparison Section (Only for Free users) */}
        {!isPremium && (
          <div className="bg-slate-900 rounded-[48px] p-10 md:p-16 text-white overflow-hidden relative">
            <h3 className="text-3xl font-black mb-10 text-center">Compare the Paths</h3>
            <div className="grid grid-cols-2 gap-8 md:gap-16">
               <div className="space-y-6">
                  <h4 className="text-slate-400 font-black uppercase tracking-widest text-xs border-b border-white/10 pb-4">Standard Learner</h4>
                  <ul className="space-y-4">
                     <li className="flex items-center text-slate-400 text-sm font-medium">
                        <i className="fas fa-times mr-3 opacity-50"></i> 3 Roadmap Limit
                     </li>
                     <li className="flex items-center text-slate-400 text-sm font-medium">
                        <i className="fas fa-times mr-3 opacity-50"></i> Standard AI Speed
                     </li>
                     <li className="flex items-center text-slate-400 text-sm font-medium">
                        <i className="fas fa-times mr-3 opacity-50"></i> Ad-supported
                     </li>
                     <li className="flex items-center text-slate-400 text-sm font-medium">
                        <i className="fas fa-times mr-3 opacity-50"></i> Local storage only
                     </li>
                  </ul>
               </div>
               <div className="space-y-6">
                  <h4 className="text-amber-400 font-black uppercase tracking-widest text-xs border-b border-white/10 pb-4">Master Polymath</h4>
                  <ul className="space-y-4">
                     <li className="flex items-center text-white text-sm font-bold">
                        <i className="fas fa-check text-amber-500 mr-3"></i> Unlimited Roadmaps
                     </li>
                     <li className="flex items-center text-white text-sm font-bold">
                        <i className="fas fa-check text-amber-500 mr-3"></i> Priority Architecture
                     </li>
                     <li className="flex items-center text-white text-sm font-bold">
                        <i className="fas fa-check text-amber-500 mr-3"></i> Zero Advertisements
                     </li>
                     <li className="flex items-center text-white text-sm font-bold">
                        <i className="fas fa-check text-amber-500 mr-3"></i> Real-time Cloud Sync
                     </li>
                  </ul>
               </div>
            </div>
            
            <div className="mt-12 text-center">
              <button onClick={onUpgrade} className="px-10 py-5 bg-amber-500 text-white font-black rounded-3xl hover:bg-amber-600 transition-all shadow-xl shadow-amber-900/20">
                Switch to Master Tier
              </button>
            </div>
          </div>
        )}
        
        {/* Contact/Support */}
        <div className="text-center space-y-4">
           <p className="text-slate-400 font-medium">Questions about your premium status or payment?</p>
           <div className="flex flex-col md:flex-row items-center justify-center gap-3">
              <a 
                href="https://www.instagram.com/sah.si_?igsh=YmloN3FrZDg0dDQ4" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 font-black hover:underline flex items-center space-x-2"
              >
                <i className="fab fa-instagram"></i>
                <span>Instagram @sah.si_</span>
              </a>
              <span className="hidden md:inline text-slate-300">•</span>
              <a 
                href="mailto:shahils.sahsi@gmail.com" 
                className="text-indigo-600 font-black hover:underline flex items-center space-x-2"
              >
                <i className="far fa-envelope"></i>
                <span>shahils.sahsi@gmail.com</span>
              </a>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumView;
