
import React from 'react';
import { useI18n } from './i18n';
import BannerAd from './BannerAd';

interface PolicyViewProps {
  onBack: () => void;
  language: string;
  isPremium: boolean;
}

const PolicyView: React.FC<PolicyViewProps> = ({ onBack, language, isPremium }) => {
  const { t } = useI18n(language);

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-12 bg-slate-50 no-scrollbar">
      <div className="max-w-3xl mx-auto pb-20">
        <header className="mb-12">
          <button onClick={onBack} className="mb-6 flex items-center text-slate-500 hover:text-indigo-600 font-semibold transition-colors">
            <i className="fas fa-arrow-left mr-2"></i> Back
          </button>
          <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Blackened Database Policy</h2>
          <p className="text-slate-500 font-medium">Understanding your Data Sovereignty in OmniMaster AI.</p>
        </header>

        <BannerAd isPremium={isPremium} type="fluid" className="mb-10" />

        <div className="space-y-10">
          <section className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-6">
              <i className="fas fa-database"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-4">1. What is a "Blackened" Database?</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              At OmniMaster AI, we employ a <strong>Zero-Visibility Architecture</strong>. We call this our "Blackened Database" policy because your data is invisible (Black) to everyone except you. 
            </p>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start">
                <i className="fas fa-check text-indigo-500 mt-1.5 mr-3 text-xs"></i>
                <span><strong>No Cloud Storage:</strong> Your roadmaps, quiz results, and chat history are never sent to our servers.</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check text-indigo-500 mt-1.5 mr-3 text-xs"></i>
                <span><strong>Local Encryption:</strong> Data is stored in your browser's <code>localStorage</code>, inaccessible to other websites.</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check text-indigo-500 mt-1.5 mr-3 text-xs"></i>
                <span><strong>Opaque Processing:</strong> Gemini AI processes your requests, but the resulting "Mastery Database" is built and housed strictly on your device.</span>
              </li>
            </ul>
          </section>

          <section className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center mb-6">
              <i className="fas fa-fire"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-4">2. The Incineration Protocol</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              You possess the absolute right to incinerate your data. When you select <strong>"Delete Everything"</strong> in your settings, the following occurs:
            </p>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 font-mono text-sm text-slate-700">
              [SYSTEM] Triggering Blackened_Wipe_Sequence...<br/>
              [STATUS] LocalStorage Keys Identified: 4<br/>
              [ACTION] Scrubbing omnimaster_auth... DONE<br/>
              [ACTION] Scrubbing omnimaster_subjects... DONE<br/>
              [ACTION] Scrubbing omnimaster_usage... DONE<br/>
              [RESULT] 0 bytes remaining. Digital footprint neutralized.
            </div>
          </section>

          <section className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6">
              <i className="fas fa-file-export"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-4">3. Data Portability</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              Because your database is blackened (local), it is also fragile. If you switch devices or clear your browser cache manually, your progress will be lost. 
            </p>
            <p className="text-slate-600 leading-relaxed">
              We provide a <strong>JSON Export</strong> tool. This allows you to take your "Blackened Database" and move it to another device, maintaining your data sovereignty without ever needing a cloud middleman.
            </p>
          </section>

          <section className="bg-slate-900 p-10 rounded-[48px] text-white">
            <h3 className="text-2xl font-black mb-6 flex items-center">
              <i className="fas fa-user-shield mr-4 text-indigo-400"></i>
              Summary of Rights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-indigo-400 mb-2">You Own:</h4>
                <p className="text-sm opacity-80">Every module, every topic, and every word of your roadmap.</p>
              </div>
              <div>
                <h4 className="font-bold text-indigo-400 mb-2">We See:</h4>
                <p className="text-sm opacity-80">Absolutely nothing. Your learning journey is your own.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PolicyView;
