
import React from 'react';
import { SavedSubject } from '../types';
import { useI18n } from '../services/i18n';
import BannerAd from './BannerAd';

interface SubjectListProps {
  subjects: SavedSubject[];
  onSelectSubject: (id: string) => void;
  onDeleteSubject: (id: string) => void;
  onAddNew: () => void;
  activeSubjectId: string | null;
  language: string;
  isPremium: boolean;
}

const SubjectList: React.FC<SubjectListProps> = ({ subjects, onSelectSubject, onDeleteSubject, onAddNew, activeSubjectId, language, isPremium }) => {
  const { t } = useI18n(language);
  const calculateProgress = (subject: SavedSubject) => {
    const totalTopics = subject.roadmap.steps.reduce((acc, step) => acc + step.topics.length, 0);
    if (totalTopics === 0) return 0;
    return Math.round((subject.completedTopics.length / totalTopics) * 100);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{t('nav.roadmaps')}</h2>
            <p className="text-slate-500">Track your progress across all your mastery journeys.</p>
          </div>
          <button 
            onClick={onAddNew}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 transform hover:scale-105 active:scale-95"
          >
            <i className="fas fa-plus"></i>
            <span>New Subject</span>
          </button>
        </header>

        <BannerAd isPremium={isPremium} type="fluid" className="mb-10" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Add New Card */}
          <div 
            onClick={onAddNew}
            className="group border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all min-h-[250px]"
          >
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
              <i className="fas fa-plus text-2xl"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-700 group-hover:text-indigo-600">Start New Mastery</h3>
            <p className="text-sm text-slate-400 mt-2">Use AI to generate a new roadmap</p>
          </div>

          {subjects.map((subject) => {
            const progress = calculateProgress(subject);
            const isActive = subject.id === activeSubjectId;
            
            return (
              <div 
                key={subject.id}
                onClick={() => onSelectSubject(subject.id)}
                className={`group relative bg-white p-6 rounded-2xl shadow-sm border transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
                  isActive ? 'border-indigo-600 ring-2 ring-indigo-600/10' : 'border-slate-100'
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl font-bold">
                    {subject.subject.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex items-center space-x-2">
                    {progress === 100 && (
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                        {t('home.mastered')}
                      </span>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSubject(subject.id);
                      }}
                      className="w-8 h-8 bg-slate-50 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center transition-all group/del"
                      title="Delete Roadmap"
                    >
                      <i className="fas fa-trash-alt text-xs group-hover/del:scale-110 transition-transform"></i>
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors truncate">
                  {subject.subject}
                </h3>
                <p className="text-xs text-slate-400 mb-6 uppercase tracking-wider font-semibold">
                  {subject.roadmap.steps.length} Modules • {subject.roadmap.steps.reduce((acc, step) => acc + step.topics.length, 0)} Topics
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">Progress</span>
                    <span className="text-indigo-600">{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-indigo-600'}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-6 flex items-center text-xs text-slate-400 font-medium">
                  <i className="far fa-calendar-alt mr-2"></i>
                  Started {new Date(subject.createdAt).toLocaleDateString()}
                </div>

                {isActive && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <i className="fas fa-play text-[10px]"></i>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {subjects.length === 0 && (
          <div className="text-center py-10">
            <p className="text-slate-400 italic">No existing roadmaps. Start your first journey above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectList;
