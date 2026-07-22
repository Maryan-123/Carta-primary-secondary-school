import React, { useState } from 'react';
import { PortalRole } from '../types';

interface Props {
  onLoginSuccess: (role: PortalRole) => void;
  onShowToast: (msg: string) => void;
}

export const LoginScreen: React.FC<Props> = ({ onLoginSuccess, onShowToast }) => {
  const [username, setUsername] = useState('a.johnson@carta.edu');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      onShowToast('Please enter your username or email.');
      return;
    }

    // Smart role detection based on email/username or default to student
    if (username.toLowerCase().includes('teacher') || username.toLowerCase().includes('ibrahim')) {
      onLoginSuccess('teacher');
      onShowToast('Welcome back, Mr. Ibrahim!');
    } else if (username.toLowerCase().includes('parent') || username.toLowerCase().includes('sarah')) {
      onLoginSuccess('parent');
      onShowToast('Welcome back, Parent Portal!');
    } else {
      onLoginSuccess('student');
      onShowToast('Welcome back, Alex!');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1/2 header-gradient opacity-10 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#0030ce]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#006d30]/10 rounded-full blur-3xl pointer-events-none" />

      <main className="w-full max-w-[440px] relative z-10 flex flex-col gap-6">
        {/* Logo Section */}
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-[#1a46fd] rounded-2xl flex items-center justify-center shadow-lg mb-4 text-white">
            <span className="material-symbols-outlined text-5xl fill-1">school</span>
          </div>
          <h1 className="font-headline text-3xl font-bold text-[#0030ce] tracking-tight">
            CARTA School
          </h1>
          <p className="text-sm text-[#444657] font-medium mt-1">
            Educational Management Portal
          </p>
        </div>

        {/* Login Card */}
        <section className="glass-card rounded-2xl p-6 shadow-sm border border-[#E4E7EC]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Username Field */}
            <div className="flex flex-col gap-1">
              <label
                className="text-xs font-semibold text-[#444657] ml-1"
                htmlFor="username"
              >
                Username
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747688] group-focus-within:text-[#0030ce] transition-colors">
                  person
                </span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. j.doe@carta.edu"
                  className="w-full pl-11 pr-4 py-3 bg-[#ffffff] border border-[#c4c5da] rounded-xl text-sm text-[#1a1b25] placeholder:text-[#c4c5da] focus:outline-none focus:border-[#1a46fd] focus:ring-2 focus:ring-[#1a46fd]/20 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1">
              <label
                className="text-xs font-semibold text-[#444657] ml-1"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747688] group-focus-within:text-[#0030ce] transition-colors">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-[#ffffff] border border-[#c4c5da] rounded-xl text-sm text-[#1a1b25] placeholder:text-[#c4c5da] focus:outline-none focus:border-[#1a46fd] focus:ring-2 focus:ring-[#1a46fd]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747688] hover:text-[#1a1b25] transition-colors"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#c4c5da] text-[#0030ce] focus:ring-[#0030ce]/20 cursor-pointer"
                />
                <span className="text-xs text-[#444657] group-hover:text-[#1a1b25] transition-colors font-medium">
                  Remember Me
                </span>
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  onShowToast('Password reset link sent to your registered email.');
                }}
                className="text-xs text-[#0030ce] hover:underline font-semibold"
              >
                Forgot Password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-[#1a46fd] text-white font-headline font-bold py-3.5 rounded-xl shadow-md hover:bg-[#0030ce] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <span>Login</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </form>

          {/* Quick Demo Sign-In Buttons */}
          <div className="mt-6 pt-4 border-t border-[#c4c5da]/60">
            <p className="text-[11px] font-bold text-[#747688] uppercase tracking-wider text-center mb-3">
              Or Quick Sign-In As:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  onLoginSuccess('student');
                  onShowToast('Logged in as Student Alex');
                }}
                className="p-2 bg-[#f4f2ff] hover:bg-[#dee0ff] text-[#0030ce] rounded-lg text-xs font-bold border border-[#bac3ff] transition-all"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => {
                  onLoginSuccess('parent');
                  onShowToast('Logged in as Parent (Sarah & John)');
                }}
                className="p-2 bg-[#f4f2ff] hover:bg-[#dee0ff] text-[#0030ce] rounded-lg text-xs font-bold border border-[#bac3ff] transition-all"
              >
                Parent
              </button>
              <button
                type="button"
                onClick={() => {
                  onLoginSuccess('teacher');
                  onShowToast('Logged in as Mr. Ibrahim');
                }}
                className="p-2 bg-[#f4f2ff] hover:bg-[#dee0ff] text-[#0030ce] rounded-lg text-xs font-bold border border-[#bac3ff] transition-all"
              >
                Teacher
              </button>
            </div>
          </div>
        </section>

        {/* Footer / Server Status */}
        <footer className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-[#006d30] rounded-full animate-pulse" />
              <span className="text-xs text-[#444657] font-medium">
                Server Status: <span className="text-[#006d30] font-bold">Connected</span>
              </span>
            </div>
            <span className="text-xs text-[#747688]">v1.0.0</span>
          </div>

          <div className="p-3 bg-[#f4f2ff] border border-[#c4c5da]/40 rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0030ce] text-xl">wifi</span>
            <p className="text-xs text-[#444657]">
              <span className="font-bold text-[#0030ce]">Help:</span> Connect to School Wi-Fi for automatic authentication.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};
