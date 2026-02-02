
import React, { useState, useMemo } from 'react';
import { LeaderboardEntry, AuthUser, SavedSubject } from './types';

interface CommunityViewProps {
  currentUser: AuthUser;
  subjects: SavedSubject[];
  onLoginRequired: () => void;
}

const CommunityView: React.FC<CommunityViewProps> = ({ currentUser, subjects, onLoginRequired }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<LeaderboardEntry | null>(null);

  const isGuest = currentUser.isGuest;

  // Mock Global Leaderboard Data
  const mockLeaderboard: LeaderboardEntry[] = useMemo(() => {
    // Satisfy LeaderboardEntry interface by including followersCount in base mock data
    const base: LeaderboardEntry[] = [
      { masterId: 'OMNI-X9J2R4', name: 'Sarah Chen', photoUrl: 'https://i.pravatar.cc/150?u=sarah', totalMasteryPoints: 142, subjectsCount: 8, followersCount: 45 },
      { masterId: 'OMNI-L2K8P1', name: 'Marcus Aurelius', photoUrl: 'https://i.pravatar.cc/150?u=marcus', totalMasteryPoints: 128, subjectsCount: 5, followersCount: 12 },
      { masterId: 'OMNI-T5M3Q9', name: 'Elena Rodriguez', photoUrl: 'https://i.pravatar.cc/150?u=elena', totalMasteryPoints: 95, subjectsCount: 4, followersCount: 8 },
      { masterId: 'OMNI-B7W4C0', name: 'Devin Page', photoUrl: 'https://i.pravatar.cc/150?u=devin', totalMasteryPoints: 84, subjectsCount: 6, followersCount: 21 },
      { masterId: 'OMNI-Z1Y6N2', name: 'Kenji Sato', photoUrl: 'https://i.pravatar.cc/150?u=kenji', totalMasteryPoints: 72, subjectsCount: 3, followersCount: 5 },
    ];

    const currentPoints = subjects.reduce((acc, sub) => acc + sub.completedTopics.length, 0);
    // Include mandatory followersCount for the current user entry
    const currentEntry: LeaderboardEntry = {
      masterId: currentUser.masterId,
      name: currentUser.name,
      photoUrl: currentUser.photoUrl,
      totalMasteryPoints: currentPoints,
      subjectsCount: subjects.length,
      followersCount: currentUser.followersCount || 0,
      isCurrentUser: true
    };

    return [...base, currentEntry].sort((a, b) => b.totalMasteryPoints - a.totalMasteryPoints);
  }, [currentUser, subjects]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) return;
    const query = searchQuery.trim().toUpperCase();
    const result = mockLeaderboard.find(entry => entry.masterId === query);
    setSearchResult(result || null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-12 bg-slate-50 relative">
      {/* Blur Overlay for Guests */}
      {isGuest && (
        <div className="absolute inset-0 z-10 backdrop-blur-md bg-white/30 flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white p-12 rounded-[40px] shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              <i className="fas fa-lock"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">Mastery Community Locked</h3>
            <p className="text-slate-500 mb-8 font-medium">
              Join the global network of learners to track your rank, compete on leaderboards, and share your progress with others.
            </p>
            <button 
              onClick={onLoginRequired}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
            >
              Sign In to Unlock
            </button>
          </div>
        </div>
      )}

      <div className={`max-w-4xl mx-auto ${isGuest ? 'opacity-20 pointer-events-none' : ''}`}>
        <header className="mb-12 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-900 mb-2">Omni Community</h2>
            <p className="text-slate-500 font-medium">Rank up, share your ID, and master everything together.</p>
          </div>
          {!isGuest && (
            <div className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-slate-100 inline-flex flex-col items-center lg:items-start">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Master ID</span>
               <span className="text-xl font-black text-indigo-600 font-mono tracking-tighter">{currentUser.masterId}</span>
            </div>
          )}
        </header>

        {/* Search Bar */}
        <div className="mb-12">
          <form onSubmit={handleSearch} className="relative group">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Master ID (e.g. OMNI-A1B2C3)"
              className="w-full pl-14 pr-32 py-5 bg-white border border-slate-200 rounded-[30px] shadow-xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-lg font-bold"
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
              <i className="fas fa-search text-xl"></i>
            </div>
            <button 
              type="submit"
              className="absolute right-3 top-3 bottom-3 px-8 bg-indigo-600 text-white font-black rounded-[22px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              Find
            </button>
          </form>

          {searchResult && (
             <div className="mt-4 p-6 bg-indigo-600 rounded-[30px] shadow-xl animate-in zoom-in-95 duration-300 flex items-center justify-between text-white">
               <div className="flex items-center space-x-4">
                  <img src={searchResult.photoUrl} className="w-14 h-14 rounded-full border-2 border-white/20" alt="Result" />
                  <div>
                    <h4 className="text-lg font-black">{searchResult.name}</h4>
                    <p className="text-xs opacity-80 font-bold uppercase tracking-widest">{searchResult.masterId}</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-2xl font-black">{searchResult.totalMasteryPoints}</p>
                  <p className="text-[10px] opacity-70 uppercase font-black tracking-widest">Mastery Points</p>
               </div>
             </div>
          )}
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-800">Global Leaderboard</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Season 1: Early Access</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Learner</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Subjects</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Mastery Points</th>
                </tr>
              </thead>
              <tbody>
                {mockLeaderboard.map((entry, idx) => (
                  <tr 
                    key={entry.masterId} 
                    className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${entry.isCurrentUser ? 'bg-indigo-50/50' : ''}`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full">
                        {idx === 0 ? <i className="fas fa-crown text-yellow-500 text-xl"></i> : 
                         idx === 1 ? <i className="fas fa-award text-slate-400 text-xl"></i> :
                         idx === 2 ? <i className="fas fa-award text-amber-700 text-xl"></i> :
                         <span className="font-black text-slate-300 text-lg">{idx + 1}</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <img src={entry.photoUrl} className="w-10 h-10 rounded-full border border-slate-200" alt="p" />
                        <div>
                          <p className={`font-black text-sm ${entry.isCurrentUser ? 'text-indigo-600' : 'text-slate-800'}`}>
                            {entry.name} {entry.isCurrentUser && '(You)'}
                          </p>
                          <p className="text-[9px] font-mono text-slate-400 font-bold">{entry.masterId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center font-bold text-slate-500 text-sm">{entry.subjectsCount}</td>
                    <td className="px-8 py-6 text-right">
                      <span className="font-black text-indigo-600 text-lg">{entry.totalMasteryPoints}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityView;
