
import React from 'react';
import { LeaderboardEntry, AuthUser } from '../types';
import BannerAd from './BannerAd';

interface PublicProfileViewProps {
  currentUser: AuthUser;
  profileUser: LeaderboardEntry;
  onBack: () => void;
  isPremium: boolean;
}

const getMasteryQuote = (points: number, subjects: number) => {
  if (points >= 500) return "A legendary mind that has transcended the ordinary. Every subject is a new universe conquered.";
  if (points >= 200) return "Mastery is not a destination, but a continuous ascent. This path is carved with pure discipline.";
  if (subjects >= 10) return "Versatility is the hallmark of a true polymath. Breadth of knowledge is your greatest power.";
  if (points >= 50) return "Consistency is the architect of genius. Each topic mastered is a stone in your monument of wisdom.";
  if (points >= 10) return "The flame of curiosity is lit. With every quiz, you forge a sharper version of yourself.";
  return "The journey of a thousand subjects begins with a single module. Stay hungry, stay curious.";
};

const PublicProfileView: React.FC<PublicProfileViewProps> = ({ currentUser, profileUser, onBack, isPremium }) => {
  const isMe = profileUser.masterId === currentUser.masterId;
  const profileVisible = profileUser.isPublicProfile !== false || isMe;
  const pathsVisible = (profileUser.isPublicPaths === true || isMe) && profileUser.publicSubjects && profileUser.publicSubjects.length > 0;

  // Identity Masking
  const displayName = profileVisible ? profileUser.name : "Hidden Identity";
  const displayPhoto = profileVisible ? profileUser.photoUrl : `https://ui-avatars.com/api/?name=?&background=slate&color=fff&size=128`;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-12 lg:p-16 no-scrollbar">
      <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-500">
        
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 font-bold hover:text-indigo-600 transition-colors"
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Leaderboard
        </button>

        {/* Header Section */}
        <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-10">
          <div className="relative">
            <div className={`w-32 h-32 md:w-40 md:h-40 rounded-[40px] overflow-hidden border-4 border-indigo-50 shadow-xl ${!profileVisible ? 'grayscale opacity-50' : ''}`}>
              <img 
                src={displayPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=indigo&color=fff&size=128`} 
                className="w-full h-full object-cover" 
                alt="Profile" 
              />
            </div>
            {profileVisible && (
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
                <i className="fas fa-check text-xs"></i>
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <h2 className="text-4xl font-black text-slate-900">{displayName}</h2>
              {!profileVisible && (
                <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest self-center md:self-auto">Anonymous</span>
              )}
            </div>
            <p className="text-indigo-600 font-bold font-mono tracking-tight text-sm uppercase">{profileUser.masterId}</p>

            <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-4">
              <div className="px-5 py-2 bg-indigo-600 text-white rounded-2xl flex items-center space-x-2 shadow-lg shadow-indigo-100">
                <i className="fas fa-star"></i>
                <span className="text-sm font-black">{profileUser.totalMasteryPoints} Mastery Points</span>
              </div>
            </div>
          </div>
        </div>

        <BannerAd isPremium={isPremium} type="fluid" />

        {/* Profile Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center">
                <i className="fas fa-medal mr-3 text-amber-500"></i> Rank Insights
              </h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <span className="text-xs font-bold text-slate-500 uppercase">Global Standing</span>
                    <span className="font-black text-indigo-600">Master Learner</span>
                 </div>
                 <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <span className="text-xs font-bold text-slate-500 uppercase">Subjects Mastery</span>
                    <span className="font-black text-indigo-600">{profileUser.subjectsCount || 0}</span>
                 </div>
              </div>
           </div>

           <div className="bg-indigo-900 p-8 rounded-[40px] text-white flex flex-col justify-center text-center shadow-xl shadow-indigo-100">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-4">Mastery Philosophy</p>
              <p className="text-xl font-bold italic leading-relaxed">
                "{getMasteryQuote(profileUser.totalMasteryPoints, profileUser.subjectsCount)}"
              </p>
           </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 text-center py-12 overflow-hidden relative">
           {!(profileUser.isPublicPaths === true || isMe) ? (
             <div className="animate-in fade-in duration-700">
               <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                 <i className="fas fa-eye-slash text-4xl"></i>
               </div>
               <h4 className="text-2xl font-black text-slate-800 mb-2">Mastery Path is Private</h4>
               <p className="text-sm font-medium text-slate-400 max-w-sm mx-auto">This learner prefers to travel their road to genius in silence.</p>
             </div>
           ) : profileUser.publicSubjects && profileUser.publicSubjects.length > 0 ? (
             <div className="max-w-3xl mx-auto">
               <div className="flex items-center justify-center space-x-3 mb-8">
                  <i className="fas fa-route text-3xl text-indigo-600"></i>
                  <h4 className="text-2xl font-black text-slate-800">Public Mastery Path</h4>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                  {profileUser.publicSubjects.map((s, idx) => (
                    <div key={idx} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-3">
                       <div className="flex justify-between items-start">
                          <p className="text-sm font-black text-slate-800 truncate pr-2">{s.subject}</p>
                          <span className="text-xs font-black text-indigo-600">{s.progress}%</span>
                       </div>
                       <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${s.progress}%` }}></div>
                       </div>
                    </div>
                  ))}
               </div>
             </div>
           ) : (
             <div className="py-12">
               <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                 <i className="fas fa-map text-3xl"></i>
               </div>
               <h4 className="text-lg font-black text-slate-800">No Roadmaps Found</h4>
               <p className="text-sm font-medium text-slate-400">This learner hasn't shared any mastery journeys yet.</p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default PublicProfileView;
