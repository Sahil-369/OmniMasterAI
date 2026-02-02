
import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, AuthUser, SavedSubject } from '../types';
import { supabaseService } from './../services/supabaseService';
import BannerAd from './BannerAd';

interface LeaderboardViewProps {
  currentUser: AuthUser;
  subjects: SavedSubject[];
  onLoginRequired: () => void;
  onSelectUser: (user: LeaderboardEntry) => void;
  isPremium: boolean;
}

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ currentUser, subjects, onLoginRequired, onSelectUser, isPremium }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isGuest = currentUser.isGuest;

  const loadLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await supabaseService.fetchLeaderboard();
      const currentPoints = subjects.reduce((acc, sub) => acc + sub.completedTopics.length, 0);
      
      // Get current user's actual premium status from Supabase using 'premium' column
      const profile = await supabaseService.getProfile(currentUser.id);

      const currentEntry: LeaderboardEntry = {
        masterId: currentUser.masterId,
        name: currentUser.name,
        photoUrl: currentUser.photoUrl,
        totalMasteryPoints: currentPoints,
        subjectsCount: subjects.length,
        isCurrentUser: true,
        isPublicProfile: true, // Current user sees themselves as public in their own view
        isPremium: profile?.premium === true
      };

      if (data && data.length > 0) {
        const filtered = data.filter(d => d.masterId !== currentUser.masterId);
        const final = [...filtered, currentEntry].sort((a, b) => b.totalMasteryPoints - a.totalMasteryPoints);
        setLeaderboard(final);
      } else {
        setLeaderboard([currentEntry]);
      }
    } catch (err) {
      console.error("Leaderboard loading failed:", err);
      setError("Unable to reach the mastery ranks. Check connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isGuest) loadLeaderboard();
  }, [isGuest]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden h-full">
      <div className="bg-white border-b border-slate-200 px-6 shrink-0 z-20 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Global Hall of Fame</h2>
          <button 
            onClick={loadLeaderboard} 
            disabled={isLoading}
            className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-95"
          >
            <i className={`fas fa-sync-alt ${isLoading ? 'animate-spin' : ''}`}></i>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-12 relative no-scrollbar">
        {isGuest && (
          <div className="absolute inset-0 z-[30] backdrop-blur-md bg-white/30 flex items-center justify-center p-6 text-center">
            <div className="max-w-md bg-white p-12 rounded-[48px] shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                <i className="fas fa-trophy"></i>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Mastery Ranking Locked</h3>
              <p className="text-slate-500 mb-8 font-medium">Connect with the global community of learners to track your rank and compete with the world's most disciplined minds.</p>
              <button onClick={onLoginRequired} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all active:scale-95">Sign In Now</button>
            </div>
          </div>
        )}

        <div className={`max-w-4xl mx-auto h-full flex flex-col ${isGuest ? 'opacity-20 pointer-events-none' : ''}`}>
          <div className="animate-in fade-in duration-500 space-y-8 pb-20">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl font-bold text-sm text-center">
                <i className="fas fa-exclamation-triangle mr-2"></i> {error}
              </div>
            )}

            <BannerAd isPremium={isPremium} type="fluid" />

            <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Learner</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Mastery Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, idx) => {
                      // Privacy Logic: If profile is NOT public, mask identity
                      const isVisible = entry.isPublicProfile !== false || entry.isCurrentUser;
                      const displayName = isVisible ? entry.name : "Private Master";
                      const displayPhoto = isVisible ? entry.photoUrl : `https://ui-avatars.com/api/?name=?&background=slate&color=fff&size=128`;
                      
                      return (
                        <tr 
                          key={entry.masterId} 
                          onClick={() => onSelectUser(entry)}
                          className={`border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group ${entry.isCurrentUser ? 'bg-indigo-50/50' : ''}`}
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full">
                              {idx === 0 ? <i className="fas fa-award text-2xl text-yellow-500"></i> : 
                               idx === 1 ? <i className="fas fa-award text-2xl text-slate-400"></i> : 
                               idx === 2 ? <i className="fas fa-award text-2xl text-amber-700"></i> : 
                               <span className="font-black text-slate-300">{idx + 1}</span>}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-4">
                              <img src={displayPhoto} className={`w-12 h-12 rounded-2xl border border-slate-100 shadow-sm ${!isVisible ? 'grayscale opacity-50' : ''}`} alt="p" />
                              <div>
                                <div className="flex items-center space-x-1.5">
                                  <p className={`font-black text-sm group-hover:text-indigo-600 transition-colors ${entry.isCurrentUser ? 'text-indigo-600' : 'text-slate-800'}`}>
                                    {displayName} {entry.isCurrentUser && '(You)'}
                                  </p>
                                  {entry.isPremium && (
                                    <div className="bg-blue-500 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-sm" title="Verified Premium User">
                                      <i className="fas fa-check"></i>
                                    </div>
                                  )}
                                </div>
                                <p className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-tighter">{entry.masterId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right font-black text-indigo-600 text-lg">
                            {entry.totalMasteryPoints}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardView;
