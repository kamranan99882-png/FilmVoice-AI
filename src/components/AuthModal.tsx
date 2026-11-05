import React, { useState } from 'react';
import { X, Lock, Mail, User, HardDrive, CheckCircle2, ShieldCheck, LogOut } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  uiLang: 'en' | 'ur';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  uiLang,
}) => {
  const [tab, setTab] = useState<'profile' | 'login' | 'register'>('profile');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const displayName = email.split('@')[0];
    onUpdateUser({
      ...user,
      id: 'usr_' + Date.now(),
      name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
      email,
      isGuest: false,
    });
    setSuccessMsg('Successfully logged in!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onUpdateUser({
      ...user,
      id: 'usr_' + Date.now(),
      name: name || email.split('@')[0],
      email,
      isGuest: false,
    });
    setSuccessMsg('Account registered successfully!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  const handleContinueGuest = () => {
    onUpdateUser({
      ...user,
      id: 'usr_guest',
      name: 'Studio Guest',
      email: 'guest@aistudio.local',
      isGuest: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {uiLang === 'ur' ? 'یوزر لاگ ان اور اسٹوریج' : 'Account & Cloud Storage'}
              </h2>
              <p className="text-xs text-slate-400">
                {uiLang === 'ur'
                  ? 'محفوظ کلاؤڈ اسٹوریج اور پروجیکٹ سنک'
                  : 'Secure local profile & cloud project storage'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {successMsg && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Current User Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white font-extrabold text-sm uppercase shadow-md">
                {user.name.charAt(0)}
              </div>
              <div>
                <span className="font-bold text-white text-sm block">{user.name}</span>
                <span className="text-xs text-slate-400 block">{user.email}</span>
                <span className="inline-block mt-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {user.isGuest ? 'Guest Session' : 'Verified Member'}
                </span>
              </div>
            </div>

            <button
              onClick={handleContinueGuest}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 font-semibold transition"
              title="Reset to Guest"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Secure Cloud Storage Meter */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                Cloud Storage
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {user.storageUsedMB} MB / {user.storageLimitMB} MB
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (user.storageUsedMB / user.storageLimitMB) * 100)}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Allocated for video assets, synthesized neural voices, and project backups.
            </p>
          </div>

          {/* Switch tabs to login or register */}
          <div className="flex border-b border-slate-800 text-xs font-bold gap-3 pt-2">
            <button
              onClick={() => setTab('login')}
              className={`pb-2 border-b-2 transition ${
                tab === 'login' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('register')}
              className={`pb-2 border-b-2 transition ${
                tab === 'register' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400'
              }`}
            >
              Create Account
            </button>
          </div>

          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg transition"
              >
                Sign In to Cloud
              </button>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Kamran"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg transition"
              >
                Create Free Account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
