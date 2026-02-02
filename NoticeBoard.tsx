
import React, { useState } from 'react';
import { NoticeData } from '../types';

interface NoticeBoardProps {
  notice: NoticeData | null;
  onDismiss: () => void;
  onRefresh: () => Promise<void>;
}

const NoticeBoard: React.FC<NoticeBoardProps> = ({ notice, onDismiss, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'notice' | 'warning' | 'updates'>('warning');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  // Determine if there's actually anything to show
  const hasNotice = !!notice?.notice;
  const hasWarning = !!notice?.warning;
  const hasUpdates = !!notice?.updates;

  // Auto-set initial active tab based on priority: Warning > Updates > Notice
  React.useEffect(() => {
    if (hasWarning) setActiveTab('warning');
    else if (hasUpdates) setActiveTab('updates');
    else if (hasNotice) setActiveTab('notice');
  }, [hasWarning, hasUpdates, hasNotice]);

  if (!hasNotice && !hasWarning && !hasUpdates) return (
    <div className="mb-12 flex justify-end">
       <button 
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
      >
        <i className={`fas fa-sync-alt ${isRefreshing ? 'animate-spin' : ''}`}></i>
        <span>Check for Updates</span>
      </button>
    </div>
  );

  const getTheme = () => {
    switch (activeTab) {
      case 'warning': return { 
        bg: 'bg-red-600', 
        text: 'text-red-700', 
        lightBg: 'bg-red-50', 
        border: 'border-red-100', 
        icon: 'fa-exclamation-triangle',
        label: 'Urgent Alert'
      };
      case 'updates': return { 
        bg: 'bg-blue-600', 
        text: 'text-blue-700', 
        lightBg: 'bg-blue-50', 
        border: 'border-blue-100', 
        icon: 'fa-microchip',
        label: 'System Log'
      };
      default: return { 
        bg: 'bg-indigo-600', 
        text: 'text-indigo-700', 
        lightBg: 'bg-indigo-50', 
        border: 'border-indigo-100', 
        icon: 'fa-bullhorn',
        label: 'Announcement'
      };
    }
  };

  const theme = getTheme();
  const currentContent = notice ? notice[activeTab] : null;

  return (
    <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden animate-in slide-in-from-top-6 duration-500 mb-12">
      <div className="flex flex-col md:flex-row min-h-[220px]">
        {/* Left Icon Panel */}
        <div className={`md:w-1/4 ${theme.bg} p-8 text-white flex flex-col justify-center items-center text-center relative overflow-hidden transition-colors duration-500`}>
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -ml-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
              <i className={`fas ${theme.icon} text-2xl ${activeTab === 'warning' ? 'animate-pulse' : ''}`}></i>
            </div>
            <h3 className="text-xl font-black uppercase tracking-widest leading-tight">{activeTab}</h3>
            <div className="mt-4 inline-block px-3 py-1 bg-white/20 backdrop-blur text-white text-[9px] font-black rounded-full uppercase tracking-tighter border border-white/20">
              {theme.label}
            </div>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 p-8 md:p-10 flex flex-col relative bg-white">
          {/* Header Controls */}
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-slate-300 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-slate-50"
            >
              <i className={`fas fa-sync-alt ${isRefreshing ? 'animate-spin' : ''}`}></i>
            </button>
            <button 
              onClick={onDismiss}
              className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-slate-50"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Tab Selection */}
          <div className="flex items-center space-x-2 mb-6">
            {hasNotice && (
              <button 
                onClick={() => setActiveTab('notice')}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'notice' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
              >
                Notices
              </button>
            )}
            {hasWarning && (
              <button 
                onClick={() => setActiveTab('warning')}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'warning' ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
              >
                Warnings
              </button>
            )}
            {hasUpdates && (
              <button 
                onClick={() => setActiveTab('updates')}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'updates' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
              >
                Updates
              </button>
            )}
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            {currentContent ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <p className={`text-lg md:text-xl font-bold leading-relaxed ${activeTab === 'warning' ? 'text-slate-900' : 'text-slate-700'}`}>
                  {currentContent}
                </p>
                <div className="flex items-center space-x-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <i className="far fa-clock text-indigo-400"></i>
                  <span>Cloud Feed Active</span>
                </div>
              </div>
            ) : (
              <div className="text-slate-300 italic text-sm">No details for this category.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeBoard;
