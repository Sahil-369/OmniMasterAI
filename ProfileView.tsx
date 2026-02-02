
import React, { useState, useRef, useEffect } from 'react';
import { AuthUser, SavedSubject } from '../types';
import { useI18n } from '../services/i18n';

interface ProfileViewProps {
  user: AuthUser;
  subjects: SavedSubject[];
  streak: number;
  masteryPoints: number;
  isPremium: boolean;
  onUpdateProfile: (name: string, photoUrl: string, emoji?: string) => Promise<void>;
  language: string;
  onGoToSettings: () => void;
}

const COMMON_EMOJIS = ['🚀', '🧠', '💡', '🔥', '🎓', '🎨', '💻', '🌍', '📚', '🏆'];
const PREMIUM_EMOJIS = ['👑', '⚡', '💎', '🛸', '🦁', '🦉', '🔭', '♟️', '🥋', '🎭', '🧬', '⚔️', '🏹', '🧘', '🏄', '🎸', '📷', '🗺️', '🐲', '🌋', '🎮', '🪐'];

const getMasteryQuote = (points: number, subjects: number) => {
  if (points >= 500) return "A legendary mind that has transcended the ordinary. Every subject is a new universe conquered.";
  if (points >= 200) return "Mastery is not a destination, but a continuous ascent. This path is carved with pure discipline.";
  if (subjects >= 10) return "Versatility is the hallmark of a true polymath. Breadth of knowledge is your greatest power.";
  if (points >= 50) return "Consistency is the architect of genius. Each topic mastered is a stone in your monument of wisdom.";
  if (points >= 10) return "The flame of curiosity is lit. With every quiz, you forge a sharper version of yourself.";
  return "The journey of a thousand subjects begins with a single module. Stay hungry, stay curious.";
};

const ProfileView: React.FC<ProfileViewProps> = ({ user, subjects, streak, masteryPoints, isPremium, onUpdateProfile, language, onGoToSettings }) => {
  const { t } = useI18n(language);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState(user.name);
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl || '');
  const [selectedEmoji, setSelectedEmoji] = useState(user.emoji || '');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    setName(user.name);
    setPhotoUrl(user.photoUrl || '');
    setSelectedEmoji(user.emoji || '');
  }, [user]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
        setSelectedEmoji(''); 
        setShowEmojiPicker(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectEmoji = (emoji: string) => {
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(emoji)}&background=indigo&color=fff&size=128&font-size=0.6`;
    setPhotoUrl(avatarUrl);
    setSelectedEmoji(emoji);
    setShowEmojiPicker(false);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsUpdating(true);
    setUpdateStatus('idle');
    try {
      await onUpdateProfile(name, photoUrl, selectedEmoji);
      setUpdateStatus('success');
      setTimeout(() => setUpdateStatus('idle'), 3000);
    } catch (e) {
      setUpdateStatus('error');
    } finally {
      setIsUpdating(false);
    }
  };

  const defaultPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=indigo&color=fff&size=128`;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-12 no-scrollbar">
      {showEmojiPicker && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowEmojiPicker(false)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
              <h4 className="font-black uppercase tracking-widest text-[10px]">Sticker Selection</h4>
              <button onClick={() => setShowEmojiPicker(false)} className="p-2"><i className="fas fa-times"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Standard</p>
                <div className="grid grid-cols-4 gap-3">
                  {COMMON_EMOJIS.map(emoji => (
                    <button key={emoji} onClick={() => selectEmoji(emoji)} className={`text-3xl aspect-square rounded-2xl flex items-center justify-center transition-all ${selectedEmoji === emoji ? 'bg-indigo-100 ring-2 ring-indigo-600' : 'bg-slate-50'}`}>{emoji}</button>
                  ))}
                </div>
              </div>
              <div className={!isPremium ? 'opacity-40 grayscale pointer-events-none' : ''}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                  Premium Tier {!isPremium && <i className="fas fa-lock ml-2 text-amber-500"></i>}
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {PREMIUM_EMOJIS.map(emoji => (
                    <button key={emoji} onClick={() => selectEmoji(emoji)} className={`text-3xl aspect-square rounded-2xl flex items-center justify-center transition-all ${selectedEmoji === emoji ? 'bg-indigo-100 ring-2 ring-indigo-600' : 'bg-slate-50'}`}>{emoji}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100">
               <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl text-xs flex items-center justify-center space-x-2">
                 <i className="fas fa-upload"></i>
                 <span>Upload Photo</span>
               </button>
               <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 pb-32">
        <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[48px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6 md:gap-10 relative">
          <button 
            onClick={onGoToSettings}
            className="absolute top-6 right-6 w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all"
            title="App Settings"
          >
            <i className="fas fa-cog"></i>
          </button>

          <div className="relative">
            <div className="w-24 h-24 md:w-40 md:h-40 rounded-[30px] md:rounded-[40px] overflow-hidden border-4 border-indigo-50 shadow-xl bg-indigo-50 flex items-center justify-center">
              {selectedEmoji && !photoUrl.startsWith('data:image') ? (
                <div className="text-4xl md:text-8xl">{selectedEmoji}</div>
              ) : (
                <img src={photoUrl || defaultPhoto} className="w-full h-full object-cover" alt="Profile" />
              )}
            </div>
            <button onClick={() => setShowEmojiPicker(true)} className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg border-4 border-white"><i className="fas fa-pen text-xs"></i></button>
          </div>

          <div className="flex-1 w-full text-center md:text-left space-y-4">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Display Name</p>
              <div className="flex flex-col md:flex-row gap-3">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-50 border-2 border-slate-100 px-4 py-3 rounded-xl text-lg font-black text-slate-900 w-full md:max-w-xs focus:border-indigo-600 outline-none" />
                <button onClick={handleSave} disabled={isUpdating} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-lg flex items-center justify-center space-x-2">
                  {isUpdating ? <i className="fas fa-spinner fa-spin"></i> : <span>Save Changes</span>}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <p className="text-indigo-600 font-black font-mono tracking-tighter text-sm uppercase">{user.masterId}</p>
              {isPremium && <span className="bg-blue-500 text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Verified</span>}
            </div>
          </div>
        </div>

        <div className="bg-indigo-900 p-8 rounded-[32px] md:rounded-[40px] text-white text-center relative overflow-hidden">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mb-3">Mastery Mantra</p>
          <p className="text-base md:text-xl font-bold italic leading-relaxed px-4">"{getMasteryQuote(masteryPoints, subjects.length)}"</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Subjects</h4>
            <p className="text-3xl font-black text-slate-900">{subjects.length}</p>
          </div>
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Mastery Pts</h4>
            <p className="text-3xl font-black text-indigo-600">{masteryPoints}</p>
          </div>
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Streak</h4>
            <p className="text-3xl font-black text-orange-500">{streak}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
