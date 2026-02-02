
import React, { useState } from 'react';
import { AuthUser } from '../types';
import { supabaseService } from '../services/supabaseService';
import Logo from './Logo';

interface LoginViewProps {
  onLogin: (user: AuthUser) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'landing' | 'auth' | 'signup'>('landing');
  const [customName, setCustomName] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState(''); 
  const [customEmail, setCustomEmail] = useState(''); 
  const [customPassword, setCustomPassword] = useState('');
  const [chosenId, setChosenId] = useState(''); 
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGuestLogin = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      const guestUser: AuthUser = {
        id: 'guest_user',
        internalId: 'GUEST-TEMP',
        masterId: 'OMNI-GUEST',
        name: 'Guest Learner',
        email: '',
        provider: 'guest',
        isGuest: true,
        photoUrl: `https://ui-avatars.com/api/?name=Guest&background=slate&color=fff&size=128`
      };
      onLogin(guestUser);
      setIsAuthenticating(false);
    }, 800);
  };

  const handleFinalizeSignup = async () => {
    if (!customName.trim() || !customPassword.trim() || !customEmail.trim() || !chosenId.trim()) {
      setError("All fields are required.");
      return;
    }

    const sanitizedId = chosenId.trim().toUpperCase();
    setIsAuthenticating(true);
    setError(null);
    
    try {
      const { data: existingEmail } = await supabaseService.checkUser(customEmail);
      if (existingEmail) {
        setError("Account already exists.");
        setIsAuthenticating(false);
        return;
      }

      const { data: existingId } = await supabaseService.checkMasterId(sanitizedId);
      if (existingId) {
        setError("Master ID taken.");
        setIsAuthenticating(false);
        return;
      }

      const { error: sbError } = await supabaseService.createProfile({
        userid: sanitizedId,
        name: customName,
        email: customEmail,
        password: customPassword
      });

      if (sbError) throw new Error(sbError.message);

      onLogin({
        id: sanitizedId,
        internalId: sanitizedId,
        masterId: `OMNI-${sanitizedId}`,
        name: customName,
        email: customEmail,
        provider: 'email',
        photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(customName)}&background=random&size=128`,
        isGuest: false
      });
    } catch (err: any) {
      setError(err.message || "Failed to create profile.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleUnifiedLogin = async () => {
    if (!loginIdentifier.trim() || !customPassword.trim()) {
      setError("Please fill all fields.");
      return;
    }
    
    setIsAuthenticating(true);
    setError(null);

    try {
      const { data } = await supabaseService.findUserByIdentifier(loginIdentifier.trim());
      
      if (data && data.password === customPassword) {
        onLogin({
          id: data.userid,
          internalId: data.userid,
          masterId: `OMNI-${data.userid.toUpperCase()}`,
          name: data.name,
          email: data.email,
          provider: 'email',
          photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random&size=128`,
          isGuest: false
        });
      } else {
        setError("Invalid credentials.");
      }
    } catch (err: any) {
      setError("Authentication error.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      <div className="max-w-md w-full glass-morphism p-10 rounded-[48px] shadow-2xl border border-white/50 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        {step === 'landing' ? (
          <div className="text-center">
            <Logo size="xl" className="mx-auto mb-8 transform -rotate-6" />
            <h1 className="text-3xl font-black text-slate-900 mb-6">OmniMaster <span className="text-indigo-600">AI</span></h1>
            
            <div className="space-y-4">
              <button onClick={() => setStep('auth')} className="w-full bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-center space-x-4 hover:border-indigo-500 transition-all shadow-sm group">
                <i className="fab fa-google text-2xl text-red-500"></i>
                <span className="font-bold text-slate-700">Continue with Google</span>
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setStep('auth')} className="bg-indigo-600 p-4 rounded-2xl flex items-center justify-center space-x-2 text-white font-bold">
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Login</span>
                </button>
                <button onClick={() => setStep('signup')} className="bg-white border-2 border-indigo-600 p-4 rounded-2xl flex items-center justify-center space-x-2 text-indigo-600 font-bold">
                  <i className="fas fa-user-plus"></i>
                  <span>Sign Up</span>
                </button>
              </div>

              <button onClick={handleGuestLogin} className="text-slate-400 hover:text-indigo-600 font-bold text-xs py-2">Continue as Guest <i className="fas fa-arrow-right ml-1"></i></button>
            </div>
          </div>
        ) : step === 'auth' ? (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <button onClick={() => setStep('landing')} className="mb-6 text-slate-400 font-bold text-sm"><i className="fas fa-arrow-left mr-2"></i> Back</button>
            <h2 className="text-2xl font-black text-slate-900 mb-6">Welcome Back</h2>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl">{error}</div>}
            <div className="space-y-4">
              <input type="text" value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} placeholder="Email or Master ID" className="w-full px-5 py-4 bg-white border rounded-2xl outline-none font-bold" />
              <input type="password" value={customPassword} onChange={(e) => setCustomPassword(e.target.value)} placeholder="Password" className="w-full px-5 py-4 bg-white border rounded-2xl outline-none font-bold" />
              <button disabled={isAuthenticating} onClick={handleUnifiedLogin} className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black shadow-xl disabled:opacity-50">
                {isAuthenticating ? 'Authenticating...' : 'Login'}
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <button onClick={() => setStep('landing')} className="mb-6 text-slate-400 font-bold text-sm"><i className="fas fa-arrow-left mr-2"></i> Back</button>
            <h2 className="text-2xl font-black text-slate-900 mb-6">Create Account</h2>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl">{error}</div>}
            <div className="space-y-4">
              <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Full Name" className="w-full px-5 py-4 bg-white border rounded-2xl font-bold" />
              <input type="email" value={customEmail} onChange={(e) => setCustomEmail(e.target.value)} placeholder="Email" className="w-full px-5 py-4 bg-white border rounded-2xl" />
              <input type="password" value={customPassword} onChange={(e) => setCustomPassword(e.target.value)} placeholder="Password" className="w-full px-5 py-4 bg-white border rounded-2xl font-bold" />
              <div className="relative">
                <span className="absolute left-5 top-4 text-slate-400 font-black text-sm">OMNI-</span>
                <input type="text" value={chosenId} onChange={(e) => setChosenId(e.target.value.toUpperCase())} placeholder="UNIQUE_ID" className="w-full pl-[68px] pr-5 py-4 bg-white border rounded-2xl font-black uppercase" maxLength={10} />
              </div>
              <button disabled={isAuthenticating} onClick={handleFinalizeSignup} className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black shadow-xl disabled:opacity-50">
                {isAuthenticating ? 'Creating...' : 'Join OmniMaster'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginView;
