
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, AppState } from '../types';
import { useI18n } from '../services/i18n';
import { getChatResponse, generateSpeech } from '../services/geminiService';
import { databaseService } from '../services/databaseService';

interface AICompanionProps {
  appState: AppState;
}

const AICompanion: React.FC<AICompanionProps> = ({ appState }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [companionState, setCompanionState] = useState<'idle' | 'thinking' | 'speaking' | 'listening'>('idle');
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const userId = appState.authUser?.id || 'guest';
  const userName = appState.userSettings.userName || 'Learner';
  const language = appState.userSettings.language || 'English';
  const persona = appState.userSettings.companionPersona || 'Friend';
  const aiVoiceGender = appState.userSettings.aiVoice || 'female';
  const { t } = useI18n(language);

  // Load cache on mount
  useEffect(() => {
    const history = databaseService.getChatHistory(userId);
    setMessages(history);
  }, [userId]);

  // Persist messages on change
  useEffect(() => {
    if (messages.length > 0) {
      databaseService.saveChatHistory(userId, messages);
    }
  }, [messages, userId]);

  const getPersonaVoice = () => {
    if (aiVoiceGender === 'male') {
      return persona === 'Brother' || persona === 'Boyfriend' ? 'Fenrir' : 'Charon';
    } else {
      return persona === 'Sister' || persona === 'Girlfriend' ? 'Zephyr' : 'Kore';
    }
  };

  const personaInstructions: Record<string, string> = {
    'Teacher': `You are "Omni," a wise teacher. 1 sentence max per response.`,
    'Friend': `You are "Omni," a high-energy best friend. Use emojis. 1 sentence max.`,
    'Brother': `You are "Omni," a playful big brother. 1 sentence max.`,
    'Sister': `You are "Omni," a caring big sister. 1 sentence max.`,
    'Girlfriend': `You are "Omni," a sweet girlfriend. 1 sentence max.`,
    'Boyfriend': `You are "Omni," a supportive boyfriend. 1 sentence max.`
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.onstart = () => { setIsListening(true); setCompanionState('listening'); };
      recognition.onresult = (event: any) => { handleSend(event.results[0][0].transcript); };
      recognition.onend = () => { setIsListening(false); setCompanionState('idle'); };
      recognitionRef.current = recognition;
    }
  }, [language]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const playPCM = async (base64Audio: string) => {
    if (!base64Audio || !audioEnabled) return;
    try {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();

      const audioData = decodeBase64(base64Audio);
      const dataInt16 = new Int16Array(audioData.buffer);
      const buffer = audioContextRef.current.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      setCompanionState('speaking');
      source.onended = () => setCompanionState('idle');
      source.start();
    } catch (e) {
      console.error("Audio playback error", e);
    }
  };

  const handleSend = async (customInput?: string) => {
    const textToSend = customInput || input;
    if (!textToSend.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setInput('');
    setIsTyping(true);
    setCompanionState('thinking');

    try {
      const textResponse = await getChatResponse(personaInstructions[persona], userName, language, "Mastery context", textToSend);
      setMessages(prev => [...prev, { role: 'model', text: textResponse }]);
      
      const audioBase64 = await generateSpeech(textResponse, getPersonaVoice());
      if (audioBase64) await playPCM(audioBase64);
      
    } catch (err) {
      setCompanionState('idle');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-[80]">
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="bg-white p-1 rounded-full shadow-2xl active:scale-95 transition-all">
          <div className={`relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-indigo-600 rounded-2xl border-2 border-white/20 shadow-lg ${companionState === 'thinking' ? 'animate-bounce' : ''}`}>
             <i className="fas fa-brain text-white text-2xl"></i>
          </div>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-x-4 bottom-24 md:absolute md:inset-auto md:right-0 md:bottom-0 w-auto md:w-96 h-[65vh] md:h-[550px] bg-white rounded-t-[32px] md:rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-slate-100 animate-in slide-in-from-bottom-10">
          <div className="p-4 md:p-5 flex items-center justify-between text-white bg-indigo-600">
            <div className="flex items-center space-x-3">
               <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><i className="fas fa-robot text-xs"></i></div>
               <span className="font-black text-xs">Omni ({persona})</span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setAudioEnabled(!audioEnabled)} 
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${audioEnabled ? 'bg-white/20' : 'bg-red-500 shadow-md'}`}
              >
                <i className={`fas ${audioEnabled ? 'fa-volume-up' : 'fa-volume-mute'}`}></i>
              </button>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-white/10 rounded-lg"><i className="fas fa-times"></i></button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 no-scrollbar">
            {messages.length === 0 && (
              <div className="text-center py-10 opacity-30">
                <p className="text-[10px] font-black uppercase tracking-widest">Start a session with your AI buddy</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-xs md:text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-800 shadow-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-[10px] text-indigo-400 font-black uppercase animate-pulse">thinking...</div>}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 md:p-4 bg-white border-t border-slate-100">
            <div className="flex items-center space-x-2">
              <button onClick={() => isListening ? recognitionRef.current?.stop() : recognitionRef.current?.start()} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                <i className={`fas ${isListening ? 'fa-stop' : 'fa-microphone'}`}></i>
              </button>
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
                placeholder="Talk to Omni..." 
                className="flex-1 bg-slate-100 rounded-xl px-4 py-3 text-sm outline-none" 
              />
              <button onClick={() => handleSend()} className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg"><i className="fas fa-paper-plane text-xs"></i></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICompanion;
