
import React from 'react';
import { Roadmap, RoadmapStep } from '../types';
import { useI18n } from '../services/i18n';

interface SidebarProps {
  roadmap: Roadmap;
  selectedStepId: string | null;
  selectedTopic: string | null;
  completedTopics: string[];
  onSelectTopic: (stepId: string, topic: string) => void;
  onClose?: () => void;
  language: string;
}

const RoadmapSidebar: React.FC<SidebarProps> = ({ roadmap, selectedStepId, selectedTopic, completedTopics, onSelectTopic, onClose, language }) => {
  const { t } = useI18n(language);
  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Sidebar Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-indigo-600 truncate max-w-[200px] leading-tight">{roadmap.subject}</h2>
          <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-black">Subject Path</p>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-100"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>
      
      {/* Scrollable Topics */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8 no-scrollbar">
        {roadmap.steps.map((step: RoadmapStep, stepIdx) => (
          <div key={step.id} className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 flex items-center uppercase tracking-[0.15em]">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] mr-3 flex-shrink-0 font-black">
                {stepIdx + 1}
              </span>
              <span className="truncate">{step.title}</span>
            </h3>
            <div className="space-y-2">
              {step.topics.map((topic) => {
                const isSelected = selectedTopic === topic;
                const isCompleted = completedTopics.includes(topic);
                
                return (
                  <button
                    key={topic}
                    onClick={() => onSelectTopic(step.id, topic)}
                    className={`w-full text-left px-4 py-3 text-sm rounded-2xl transition-all flex items-center justify-between group relative overflow-hidden ${
                      isSelected 
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 font-bold' 
                        : 'text-slate-600 hover:bg-indigo-50/50 hover:text-indigo-600 border border-transparent hover:border-indigo-100'
                    }`}
                  >
                    <span className="truncate pr-2 relative z-10">{topic}</span>
                    {isCompleted && (
                      <i className={`fas fa-check-circle text-[10px] relative z-10 ${isSelected ? 'text-white' : 'text-green-500'}`}></i>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-6 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Mastery</span>
           <span className="text-[10px] font-black text-indigo-600">{Math.round((completedTopics.length / roadmap.steps.reduce((acc, s) => acc + s.topics.length, 0)) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
           <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(completedTopics.length / roadmap.steps.reduce((acc, s) => acc + s.topics.length, 0)) * 100}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapSidebar;
