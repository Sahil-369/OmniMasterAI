
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { marked } from 'marked';
import { Roadmap, TopicDetail, QuizQuestion, AppState, SavedSubject, UserSettings, AuthUser, UserUsage, LeaderboardEntry, NoticeData } from './types';
import { generateRoadmap, generateTopicExplanation, generateQuiz, fetchDailyNews } from './services/geminiService';
import { databaseService } from './services/databaseService';
import { supabaseService } from './services/supabaseService';
import { useI18n } from './services/i18n';
import RoadmapSidebar from './components/RoadmapSidebar';
import AICompanion from './components/AICompanion';
import QuizView from './components/QuizView';
import SubjectList from './components/SubjectList';
import SettingsView from './components/SettingsView';
import LoginView from './components/LoginView';
import ProfileView from './components/ProfileView';
import LeaderboardView from './components/LeaderboardView';
import PublicProfileView from './components/PublicProfileView';
import DailyRewardModal from './components/DailyRewardModal';
import PaymentModal from './components/PaymentModal';
import NewsView from './components/NewsView';
import NoticeBoard from './components/NoticeBoard';
import BannerAd from './components/BannerAd';
import AboutView from './components/AboutView';
import PolicyView from './components/PolicyView';
import Logo from './components/Logo';

const POPULAR_SUBJECTS = [
  { name: 'Quantum Physics', icon: 'fa-atom', color: 'bg-purple-600' },
  { name: 'Public Speaking', icon: 'fa-microphone', color: 'bg-rose-600' },
  { name: 'Python Coding', icon: 'fa-code', color: 'bg-blue-600' },
  { name: 'World History', icon: 'fa-landmark', color: 'bg-amber-600' },
  { name: 'Graphic Design', icon: 'fa-palette', color: 'bg-pink-600' },
  { name: 'Marketing', icon: 'fa-bullhorn', color: 'bg-emerald-600' }
];

type AppView = 'home' | 'roadmap' | 'quiz' | 'subjects' | 'settings' | 'profile' | 'leaderboard' | 'publicProfile' | 'premium' | 'news' | 'about' | 'policy';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    authUser: databaseService.getUser(),
    currentSubjectId: null,
    savedSubjects: [],
    selectedStepId: null,
    selectedTopic: null,
    topicDetail: null,
    quiz: null,
    isLoading: false,
    isNewsLoading: false,
    loadingMessage: null,
    error: null,
    userSettings: databaseService.getSettings() || {
      userName: 'Learner',
      aiVoice: 'female',
      language: 'English',
      companionPersona: 'Friend',
      isPremium: false,
      isPublicProfile: true,
      isPublicPaths: false
    },
    currentQuote: null,
    usage: databaseService.getUsage(),
    dailyNews: [],
    notice: null
  });

  const { t } = useI18n(state.userSettings.language);
  const [view, setView] = useState<AppView>('home');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedLeaderboardUser, setSelectedLeaderboardUser] = useState<LeaderboardEntry | null>(null);
  const [isRoadmapDrawerOpen, setIsRoadmapDrawerOpen] = useState(false);
  const [isTurboActive, setIsTurboActive] = useState(!!(process.env as any).GROQ_API_KEY);

  const syncRef = useRef(state);
  useEffect(() => { syncRef.current = state; }, [state]);

  const refreshData = useCallback(async () => {
    const user = databaseService.getUser();
    if (!user) return;

    let subjects = databaseService.getSubjects(user.id);
    let settings = databaseService.getSettings() || state.userSettings;
    let usage = databaseService.getUsage();
    let notice = null;

    if (!user.isGuest) {
      const cloud = await databaseService.recoverFromCloud(user.id);
      if (cloud) {
        subjects = cloud.subjects || subjects;
        settings = cloud.settings || settings;
        usage = cloud.usage || usage;
      }

      const profile = await supabaseService.getProfile(user.id);
      if (profile) {
        const livePremium = profile.premium === true;
        settings = { ...settings, isPremium: livePremium, userName: profile.name || settings.userName };
        user.emoji = profile.emoji || user.emoji;
        databaseService.saveUser(user);
        databaseService.saveSettings(settings);
      }
      notice = await supabaseService.fetchNotice(user.id);
    }

    setState(prev => ({ ...prev, authUser: user, savedSubjects: subjects, userSettings: settings, usage, notice }));
  }, []);

  useEffect(() => { refreshData(); }, [refreshData]);

  const triggerSync = useCallback(async () => {
    if (!state.authUser || state.authUser.isGuest) return;
    await databaseService.syncToCloud(state.authUser.id, {
      subjects: syncRef.current.savedSubjects,
      settings: syncRef.current.userSettings,
      usage: syncRef.current.usage
    });
  }, [state.authUser]);

  useEffect(() => {
    const h = setTimeout(triggerSync, 4000); 
    return () => clearTimeout(h);
  }, [state.savedSubjects, state.userSettings, state.usage, triggerSync]);

  const handleGeminiError = (err: any) => {
    const isQuotaError = err?.message?.toLowerCase().includes('quota') || 
                         err?.message?.includes('429') || 
                         err?.status === 429;
                         
    const msg = isQuotaError 
      ? "AI Quota Exceeded. Please wait 60 seconds." 
      : "Teacher is not responding. Check your connection.";
    
    setState(prev => ({ ...prev, isLoading: false, error: msg }));
  };

  const handleFetchNews = useCallback(async (category: string = 'Discovery') => {
    if (state.isNewsLoading) return;
    setState(prev => ({ ...prev, isNewsLoading: true }));
    try {
      const news = await fetchDailyNews(category, state.userSettings.language);
      setState(prev => ({ ...prev, dailyNews: news, isNewsLoading: false }));
    } catch (err) {
      setState(prev => ({ ...prev, isNewsLoading: false }));
      handleGeminiError(err);
    }
  }, [state.userSettings.language, state.isNewsLoading]);

  useEffect(() => {
    if (view === 'news' && state.dailyNews.length === 0 && !state.isNewsLoading) {
      handleFetchNews('Discovery');
    }
  }, [view, state.dailyNews.length, state.isNewsLoading, handleFetchNews]);

  const handleStartMastery = async (subject: string) => {
    if (!subject.trim()) return;
    if (!state.userSettings.isPremium && state.savedSubjects.length >= 3) {
      setShowPaymentModal(true);
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, loadingMessage: "Omni is architecting your path...", error: null }));
    try {
      const roadmap = await generateRoadmap(subject, state.userSettings.language);
      const newSub: SavedSubject = { 
        id: Math.random().toString(36).substr(2, 9), 
        subject: roadmap.subject, 
        roadmap, 
        completedTopics: [], 
        createdAt: Date.now() 
      };
      const updatedSubjects = [newSub, ...state.savedSubjects];
      setState(prev => ({ ...prev, savedSubjects: updatedSubjects, currentSubjectId: newSub.id, isLoading: false }));
      databaseService.saveSubjects(state.authUser!.id, updatedSubjects);
      setView('roadmap');
    } catch (err) { 
      handleGeminiError(err);
    }
  };

  const handleSelectTopic = async (stepId: string, topic: string) => {
    const subjectId = state.currentSubjectId;
    if (!subjectId) return;

    const currentUsage = databaseService.getUsage();

    if (!state.userSettings.isPremium) {
      const subjectLessons = currentUsage.dailySubjectLessons?.[subjectId] || 0;
      const totalLessons = currentUsage.dailyTopicsCount || 0;

      if (subjectLessons >= 3) {
        setState(p => ({ ...p, error: "Subject Limit: 3 topics per subject." }));
        setShowPaymentModal(true);
        return;
      }
      if (totalLessons >= 9) {
        setState(p => ({ ...p, error: "Daily Limit: 9 topics per day." }));
        setShowPaymentModal(true);
        return;
      }
    }

    setState(prev => ({ ...prev, isLoading: true, loadingMessage: "Fetching deep insights...", selectedTopic: topic, selectedStepId: stepId, error: null }));
    setIsRoadmapDrawerOpen(false);
    
    try {
      const currentSub = state.savedSubjects.find(s => s.id === subjectId);
      const detail = await generateTopicExplanation(topic, currentSub?.subject || "", state.userSettings.language);
      
      if (!state.userSettings.isPremium) {
        const newUsage = databaseService.incrementUsage(subjectId);
        setState(p => ({ ...p, usage: newUsage, topicDetail: detail, isLoading: false }));
      } else {
        setState(prev => ({ ...prev, topicDetail: detail, isLoading: false }));
      }
    } catch (err) { 
      handleGeminiError(err);
    }
  };

  if (!state.authUser) return <LoginView onLogin={(u) => { databaseService.saveUser(u); refreshData(); }} />;

  const currentSubject = state.savedSubjects.find(s => s.id === state.currentSubjectId);
  const masteryPoints = databaseService.calculateMasteryPoints(state.savedSubjects);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col h-screen overflow-hidden font-inter selection:bg-indigo-100 selection:text-indigo-900">
      {showPaymentModal && <PaymentModal userId={state.authUser.id} plan={{ id: 'life', name: 'Mastery Tier Lifetime', price: '₹99', duration: 'Forever' }} onClose={() => setShowPaymentModal(false)} onSuccess={() => refreshData()} />}
      {state.usage.dailyRewardClaimed === false && <DailyRewardModal streak={state.usage.streak} onClaim={() => { 
        const updatedUsage = { ...state.usage, dailyRewardClaimed: true, streak: state.usage.streak + 1 };
        databaseService.saveUsage(updatedUsage);
        setState(p => ({ ...p, usage: updatedUsage }));
      }} />}

      {/* Persistent Nav */}
      <nav className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0 z-50 shadow-sm">
        <div className="flex items-center space-x-2 md:space-x-3 cursor-pointer group" onClick={() => setView('home')}>
          <Logo size="sm" />
          <span className="font-black text-slate-800 text-sm md:text-base tracking-tight">OmniMaster <span className="text-indigo-600">AI</span></span>
          {isTurboActive && (
             <div className="hidden sm:flex bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter items-center space-x-1">
                <i className="fas fa-bolt"></i>
                <span>Turbo</span>
             </div>
          )}
        </div>
        
        <div className="hidden md:flex items-center space-x-2">
          {['subjects', 'news', 'leaderboard', 'settings'].map((v: any) => (
            <button key={v} onClick={() => setView(v)} className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${view === v ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>
              {v === 'subjects' ? 'My Roads' : v === 'news' ? 'Feed' : v === 'leaderboard' ? 'Ranks' : 'Settings'}
            </button>
          ))}
        </div>

        <button onClick={() => setView('profile')} className="w-8 h-8 md:w-10 md:h-10 rounded-xl border-2 border-indigo-50 overflow-hidden shadow-sm transition-transform active:scale-95 group relative">
           <img src={state.authUser.emoji ? `https://ui-avatars.com/api/?name=${encodeURIComponent(state.authUser.emoji)}&background=indigo&color=fff` : state.authUser.photoUrl} className="w-full h-full object-cover" alt="Profile" />
           {state.userSettings.isPremium && <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full"></div>}
        </button>
      </nav>

      {/* Global Error Banner */}
      {state.error && (
        <div className="bg-red-600 text-white py-2 px-4 text-center text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top duration-300 z-[60]">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          {state.error}
          <button onClick={() => setState(p => ({ ...p, error: null }))} className="ml-4 underline">Dismiss</button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {view === 'home' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-12 no-scrollbar scroll-smooth">
            <div className="max-w-4xl mx-auto space-y-8 pb-32">
              <NoticeBoard notice={state.notice} onDismiss={() => setState(p => ({ ...p, notice: null }))} onRefresh={refreshData} />
              
              <div className="bg-indigo-600 p-8 md:p-16 rounded-[40px] shadow-2xl text-white relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000"><i className="fas fa-brain text-[120px]"></i></div>
                 <h3 className="text-2xl md:text-4xl font-black mb-8 leading-tight relative z-10">Architect your way<br/>to total mastery</h3>
                 <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                    <input 
                      type="text" 
                      placeholder="e.g. Arabic, Quantum Physics..." 
                      className="flex-1 px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl outline-none placeholder:text-white/30 font-bold focus:bg-white/20 transition-all" 
                      onKeyPress={(e) => e.key === 'Enter' && handleStartMastery((e.target as HTMLInputElement).value)} 
                    />
                    <button onClick={(e) => handleStartMastery(((e.target as HTMLElement).previousSibling as HTMLInputElement).value)} className="px-10 py-4 bg-white text-indigo-600 font-black rounded-2xl shadow-xl active:scale-90 transition-all">Architect</button>
                 </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {POPULAR_SUBJECTS.map((s, idx) => (
                  <button key={s.name} onClick={() => handleStartMastery(s.name)} className="bg-white p-5 rounded-[32px] border border-slate-100 hover:shadow-xl transition-all flex items-center space-x-4 text-left animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                    <div className={`w-10 h-10 ${s.color} text-white rounded-xl flex items-center justify-center shadow-md`}><i className={`fas ${s.icon}`}></i></div>
                    <span className="font-black text-slate-700 text-xs truncate">{s.name}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-center space-x-6 pt-4">
                 <button onClick={() => setView('about')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-colors">About Omni</button>
                 <button onClick={() => setView('policy')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-colors">Database Policy</button>
              </div>

              <BannerAd isPremium={state.userSettings.isPremium} type="display" />
            </div>
          </div>
        )}

        {view === 'news' && <NewsView news={state.dailyNews} isLoading={state.isNewsLoading} onRefresh={handleFetchNews} selectedCategory="Discovery" language={state.userSettings.language} isPremium={state.userSettings.isPremium} />}
        {view === 'subjects' && <SubjectList subjects={state.savedSubjects} onSelectSubject={(id) => { setState(p => ({ ...p, currentSubjectId: id, topicDetail: null, selectedTopic: null, error: null })); setView('roadmap'); }} onDeleteSubject={(id) => setState(p => ({ ...p, savedSubjects: p.savedSubjects.filter(s => s.id !== id) }))} onAddNew={() => setView('home')} activeSubjectId={state.currentSubjectId} language={state.userSettings.language} isPremium={state.userSettings.isPremium} />}
        {view === 'leaderboard' && <LeaderboardView currentUser={state.authUser!} subjects={state.savedSubjects} onLoginRequired={() => setView('home')} onSelectUser={(u) => { setSelectedLeaderboardUser(u); setView('publicProfile'); }} isPremium={state.userSettings.isPremium} />}
        {view === 'profile' && <ProfileView user={state.authUser!} subjects={state.savedSubjects} streak={state.usage.streak} masteryPoints={masteryPoints} isPremium={state.userSettings.isPremium} onUpdateProfile={async (n, p, e) => { const u = { ...state.authUser!, name: n, photoUrl: p, emoji: e }; databaseService.saveUser(u); refreshData(); await supabaseService.updateProfile(u.id, { name: n, emoji: e }); }} language={state.userSettings.language} onGoToSettings={() => setView('settings')} />}
        {view === 'settings' && <SettingsView settings={state.userSettings} authUser={state.authUser} onUpdateSettings={(s) => setState(p => ({ ...p, userSettings: s }))} onLogout={() => { databaseService.clearAuth(); window.location.reload(); }} onDeleteAccount={() => {}} onBack={() => setView('home')} onDataRestored={() => refreshData()} onManualSync={async () => { await triggerSync(); return true; }} />}
        {view === 'publicProfile' && selectedLeaderboardUser && <PublicProfileView currentUser={state.authUser!} profileUser={selectedLeaderboardUser} onBack={() => setView('leaderboard')} isPremium={state.userSettings.isPremium} />}
        {view === 'about' && <AboutView onGoToSettings={() => setView('settings')} language={state.userSettings.language} isPremium={state.userSettings.isPremium} />}
        {view === 'policy' && <PolicyView onBack={() => setView('home')} language={state.userSettings.language} isPremium={state.userSettings.isPremium} />}

        {view === 'roadmap' && currentSubject && (
          <div className="flex flex-1 overflow-hidden relative">
            <button 
              onClick={() => setIsRoadmapDrawerOpen(true)}
              className="lg:hidden fixed bottom-28 left-6 z-[65] bg-white border border-slate-100 text-indigo-600 px-6 py-3 rounded-full shadow-2xl font-black text-[10px] uppercase tracking-widest flex items-center space-x-2 animate-in slide-in-from-left duration-500"
            >
              <i className="fas fa-list-ul"></i>
              <span>Module Map</span>
            </button>

            {isRoadmapDrawerOpen && (
              <div className="fixed inset-0 z-[100] lg:hidden">
                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-md" onClick={() => setIsRoadmapDrawerOpen(false)}></div>
                <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl animate-in slide-in-from-left duration-300">
                  <RoadmapSidebar roadmap={currentSubject.roadmap} selectedStepId={state.selectedStepId} selectedTopic={state.selectedTopic} onSelectTopic={handleSelectTopic} completedTopics={currentSubject.completedTopics} language={state.userSettings.language} onClose={() => setIsRoadmapDrawerOpen(false)} />
                </div>
              </div>
            )}

            <div className="w-80 border-r border-slate-200 hidden lg:block bg-white shrink-0 overflow-y-auto no-scrollbar">
               <RoadmapSidebar roadmap={currentSubject.roadmap} selectedStepId={state.selectedStepId} selectedTopic={state.selectedTopic} onSelectTopic={handleSelectTopic} completedTopics={currentSubject.completedTopics} language={state.userSettings.language} />
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-slate-50 no-scrollbar relative scroll-smooth">
               {state.isLoading ? (
                 <div className="h-full flex flex-col items-center justify-center space-y-4">
                   <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                   <p className="font-black text-indigo-600 text-[10px] uppercase tracking-[0.3em] animate-pulse">{state.loadingMessage}</p>
                 </div>
               ) : state.topicDetail ? (
                 <div className="max-w-3xl mx-auto space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="flex items-center space-x-3 mb-2">
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Lesson Depth</p>
                       {isTurboActive && <span className="text-[8px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-black animate-pulse">TURBO ENABLED</span>}
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">{state.topicDetail.title}</h2>
                    <div className="bg-white p-6 md:p-12 rounded-[40px] shadow-sm border border-slate-100 markdown-body leading-relaxed">
                       <div dangerouslySetInnerHTML={{ __html: marked.parse(state.topicDetail.content) }} />
                    </div>
                    <BannerAd isPremium={state.userSettings.isPremium} type="article" />
                    <button onClick={async () => {
                      setState(p => ({ ...p, isLoading: true, loadingMessage: "Curating Mastery Test..." }));
                      try {
                        const q = await generateQuiz(state.selectedTopic!, currentSubject.subject, state.userSettings.language);
                        setState(p => ({ ...p, quiz: q, isLoading: false }));
                        setView('quiz');
                      } catch (err) { handleGeminiError(err); }
                    }} className="px-12 py-5 bg-indigo-600 text-white font-black rounded-[32px] shadow-xl hover:scale-105 active:scale-95 transition-all text-sm md:text-base">Take Mastery Quiz</button>
                 </div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-slate-300 px-10 text-center">
                    <Logo size="lg" className="opacity-10 mb-6" />
                    <p className="font-black uppercase tracking-[0.2em] text-xs opacity-50">Choose a topic from the Module Map to begin your expansion.</p>
                 </div>
               )}
            </div>
          </div>
        )}

        {view === 'quiz' && state.quiz && (
          <div className="flex-1 p-4 md:p-12 bg-slate-100 overflow-y-auto no-scrollbar scroll-smooth">
             <div className="max-w-2xl mx-auto pb-40">
               <QuizView questions={state.quiz} onComplete={() => {
                 const updated = state.savedSubjects.map(s => s.id === state.currentSubjectId ? { ...s, completedTopics: [...new Set([...s.completedTopics, state.selectedTopic!])] } : s);
                 setState(p => ({ ...p, savedSubjects: updated }));
                 databaseService.saveSubjects(state.authUser!.id, updated);
                 setView('roadmap');
               }} language={state.userSettings.language} isPremium={state.userSettings.isPremium} />
             </div>
          </div>
        )}
      </main>

      <nav className="md:hidden h-20 bg-white border-t border-slate-200 flex items-center justify-around z-[70] fixed bottom-0 inset-x-0 pb-safe shadow-inner px-2">
        {[
          { id: 'home', icon: 'home', label: 'Home' },
          { id: 'subjects', icon: 'route', label: 'Roads' },
          { id: 'news', icon: 'newspaper', label: 'Feed' },
          { id: 'leaderboard', icon: 'trophy', label: 'Ranks' },
          { id: 'settings', icon: 'cog', label: 'Settings' }
        ].map((v) => (
          <button 
            key={v.id} 
            onClick={() => setView(v.id as any)} 
            className={`flex flex-col items-center transition-all px-2 ${view === v.id ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
          >
            <i className={`fas fa-${v.icon} text-lg mb-1`}></i>
            <span className="text-[8px] font-black uppercase tracking-widest leading-none">{v.label}</span>
          </button>
        ))}
      </nav>

      <AICompanion appState={state} />
      
      <a 
        href="https://www.instagram.com/sah.si_?igsh=YmloN3FrZDg0dDQ4" 
        target="_blank" 
        className="fixed bottom-48 right-6 bg-white p-4 rounded-full shadow-2xl border border-slate-100 text-indigo-600 z-[60] transition-transform active:scale-90"
        title="Admin Support"
      >
         <i className="fab fa-instagram text-2xl"></i>
      </a>
    </div>
  );
};

export default App;
