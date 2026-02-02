
import React from 'react';
import { useI18n } from '../services/i18n';
import Logo from './Logo';
import BannerAd from './BannerAd';

interface AboutViewProps {
  onGoToSettings: () => void;
  language: string;
  isPremium: boolean;
}

const AboutView: React.FC<AboutViewProps> = ({ onGoToSettings, language, isPremium }) => {
  const { t } = useI18n(language);

  return (
    <div className="p-6 md:p-12 lg:p-20 bg-slate-50 min-h-full no-scrollbar overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-16 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Hero Section */}
        <div className="text-center">
          <Logo size="xl" className="mx-auto mb-8 transform -rotate-6 hover:rotate-0 transition-transform duration-500" />
          <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">OmniMaster <span className="text-indigo-600">AI</span></h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
            {t('about.title')}
          </p>
        </div>

        <BannerAd isPremium={isPremium} type="fluid" />

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
              <i className="fas fa-route"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-3">AI Roadmaps</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              Simply name a subject and Omni architects a logical, step-by-step roadmap from beginner to advanced mastery.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
              <i className="fas fa-book-open"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-3">Deep-Dive Lessons</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              Every topic is explained in rich detail with core pillars, practical insights, and real-world examples generated instantly.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
              <i className="fas fa-tasks"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-3">Mastery Quizzes</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              Test your knowledge after every lesson with AI-generated challenging quizzes that ensure you've truly understood the material.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
            <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
              <i className="fas fa-robot"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-3">Omni: AI Bestie</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              An interactive, proactive buddy who watches your progress, encourages you, and answers any questions via voice or chat.
            </p>
          </div>
        </div>

        {/* CREATOR & CONTACT SECTION */}
        <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-3xl">
              <i className="fas fa-user-tie"></i>
            </div>
            <div>
              <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">Developer Credits</p>
              <h4 className="text-2xl font-black text-slate-800">Sahil Singh</h4>
              <p className="text-slate-500 font-medium">Innovation driven by AI & Education.</p>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end space-y-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Query & Contact</p>
             <div className="flex flex-col gap-2 w-full md:w-auto">
                <a 
                  href="https://www.instagram.com/sah.si_?igsh=YmloN3FrZDg0dDQ4" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-indigo-50 px-6 py-3 rounded-2xl text-indigo-600 font-black text-sm hover:bg-indigo-100 transition-all flex items-center justify-center md:justify-start space-x-3"
                >
                  <i className="fab fa-instagram text-lg"></i>
                  <span>Instagram @sah.si_</span>
                </a>
                <a 
                  href="mailto:shahils.sahsi@gmail.com" 
                  className="bg-slate-50 px-6 py-3 rounded-2xl text-slate-600 font-black text-sm hover:bg-slate-100 transition-all flex items-center justify-center md:justify-start space-x-3"
                >
                  <i className="far fa-envelope text-lg"></i>
                  <span>shahils.sahsi@gmail.com</span>
                </a>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutView;
