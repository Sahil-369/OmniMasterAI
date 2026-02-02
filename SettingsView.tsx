
import React, { useState } from 'react';
import { UserSettings, AuthUser, CompanionPersona } from './types';
import { useI18n } from './i18n';
import BannerAd from './BannerAd';

interface SettingsViewProps {
  settings: UserSettings;
  authUser: AuthUser | null;
  onUpdateSettings: (settings: UserSettings) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onBack: () => void;
  onDataRestored: () => void;
  onManualSync: () => Promise<boolean>;
}

const PERSONAS: { mode: CompanionPersona; icon: string; color: string }[] = [
  { mode: 'Teacher', icon: '🎓', color: 'bg-blue-500' },
  { mode: 'Friend', icon: '🤝', color: 'bg-indigo-500' },
  { mode: 'Brother', icon: '👦', color: 'bg-emerald-500' },
  { mode: 'Sister', icon: '👧', color: 'bg-pink-500' },
  { mode: 'Girlfriend', icon: '💖', color: 'bg-rose-500' },
  { mode: 'Boyfriend', icon: '💙', color: 'bg-sky-500' }
];

const SettingsView: React.FC<SettingsViewProps> = ({ settings, authUser, onUpdateSettings, onLogout, onBack, onManualSync }) => {
  const { t } = useI18n(settings.language);
  const [isSyncing, setIsSyncing] = useState(false);

  const toggleSetting = (key: keyof UserSettings) => {
    onUpdateSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await onManualSync();
    setIsSyncing(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-slate-50 relative no-scrollbar">
      <div className="max-w-2xl mx-auto pb-40">
        <header className="mb-8">
          <button onClick={onBack} className="mb-6 flex items-center text-slate-500 font-bold hover:text-indigo-600 transition-colors">
            <i className="fas fa-arrow-left mr-2"></i> Back
          </button>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">Mastery Tools</h2>
        </header>

        <div className="space-y-6">
          {/* Persona Selection */}
          <section className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Companion Persona</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PERSONAS.map((p) => (
                <button
                  key={p.mode}
                  onClick={() => onUpdateSettings({ ...settings, companionPersona: p.mode })}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center ${settings.companionPersona === p.mode ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-50 bg-slate-50 opacity-60'}`}
                >
                  <span className="text-2xl mb-1">{p.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{p.mode}</span>
                </button>
              ))}
            </div>
          </section>

          {/* AI Voice Selection */}
          <section className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Omni's Voice</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onUpdateSettings({ ...settings, aiVoice: 'female' })}
                className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-center space-x-3 ${settings.aiVoice === 'female' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
              >
                <i className="fas fa-venus text-lg"></i>
                <span className="font-black uppercase text-xs tracking-widest">Female</span>
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, aiVoice: 'male' })}
                className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-center space-x-3 ${settings.aiVoice === 'male' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
              >
                <i className="fas fa-mars text-lg"></i>
                <span className="font-black uppercase text-xs tracking-widest">Male</span>
              </button>
            </div>
          </section>

          {/* Privacy & Social */}
          <section className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Privacy & Social</h3>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div>
                <p className="text-sm font-black text-slate-800">Public Profile</p>
                <p className="text-[10px] text-slate-400 font-bold">Appear on global leaderboard</p>
              </div>
              <button 
                onClick={() => toggleSetting('isPublicProfile')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.isPublicProfile ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.isPublicProfile ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          </section>

          <section className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Account</h3>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
               <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                   {authUser?.name.charAt(0)}
                 </div>
                 <div>
                    <p className="text-sm font-black text-slate-800">{authUser?.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{authUser?.masterId}</p>
                 </div>
               </div>
               <button onClick={handleSync} disabled={isSyncing} className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 text-indigo-600 hover:scale-105 transition-transform active:scale-95">
                 <i className={`fas fa-sync-alt ${isSyncing ? 'animate-spin' : ''}`}></i>
               </button>
            </div>
            
            <button onClick={onLogout} className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl text-xs flex items-center justify-center space-x-2 hover:bg-red-50 hover:text-red-600 transition-all">
              <i className="fas fa-sign-out-alt"></i>
              <span>Sign Out</span>
            </button>
          </section>

          <BannerAd isPremium={settings.isPremium} type="fluid" />
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
