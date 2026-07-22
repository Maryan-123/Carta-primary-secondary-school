import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, KeyRound, ShieldCheck, UserRound } from 'lucide-react';
import { api } from '../api';
import { useUIStore } from '../store';
import cartaLogo from '../assets/branding/carta-logo.jpeg';

export default function Login() {
  const navigate = useNavigate();
  const { setCurrentUser, addNotification } = useUIStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.auth.login(username.trim(), password);

      if (response.success && response.data?.user) {
        setCurrentUser(response.data.user);
        addNotification(
          'Welcome back',
          `${response.data.user.firstName} ${response.data.user.lastName} signed in successfully.`,
        );
        navigate('/portal', { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to sign in right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#0f172a_0%,#1232B8_45%,#019444_100%)]">
      <div className="min-h-screen bg-black/20 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
          <div className="grid w-full overflow-hidden rounded-[32px] border border-white/15 bg-white shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative hidden overflow-hidden bg-[#172033] lg:block">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(26,70,253,0.45),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(1,148,68,0.35),transparent_35%)]" />
              <div className="relative flex h-full flex-col justify-between p-10 text-white">
                <div className="space-y-8">
                  <img
                    src={cartaLogo}
                    alt="CARTA School logo"
                    className="h-28 w-28 rounded-full bg-white p-2 shadow-xl"
                  />
                  <div className="space-y-4">
                    <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.3em] text-white/90">
                      School Portal
                    </p>
                    <h1 className="text-4xl font-black leading-tight">
                      CARTA Primary & Secondary School
                    </h1>
                    <p className="max-w-md text-base leading-7 text-slate-200">
                      Secure access for administration, teachers, students, parents, finance, and library staff in one connected school system.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                    <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                      <ShieldCheck className="h-4 w-4 text-emerald-300" />
                      <span>Real role-based access</span>
                    </div>
                    <p className="text-sm text-slate-200">
                      Each login opens the correct dashboard and permissions for that user account.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                    <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                      <KeyRound className="h-4 w-4 text-blue-200" />
                      <span>Connected to your backend</span>
                    </div>
                    <p className="text-sm text-slate-200">
                      This portal now uses the real backend login instead of the old demo-only screen.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 lg:p-10">
              <div className="mx-auto flex h-full max-w-md flex-col justify-center">
                <Link
                  to="/"
                  className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#1232B8] transition hover:text-[#0f2a94]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to home</span>
                </Link>

                <div className="mb-8 flex items-center gap-4 lg:hidden">
                  <img
                    src={cartaLogo}
                    alt="CARTA School logo"
                    className="h-16 w-16 rounded-full border border-slate-200 bg-white p-1 shadow-sm"
                  />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#019444]">
                      School Portal
                    </p>
                    <h1 className="text-2xl font-black text-slate-900">CARTA School</h1>
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl font-black tracking-tight text-slate-900">
                    Sign in to continue
                  </h2>
                  <p className="text-sm leading-6 text-slate-500">
                    Enter the username and password created in the backend for your account.
                  </p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-semibold text-slate-700">
                      Username
                    </label>
                    <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-[#1A46FD] focus-within:bg-white">
                      <UserRound className="h-4 w-4 text-slate-400" />
                      <input
                        id="username"
                        name="username"
                        type="text"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        placeholder="Enter your username"
                        className="w-full rounded-2xl bg-transparent px-3 py-3.5 text-sm text-slate-900 outline-none"
                        autoComplete="username"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                      Password
                    </label>
                    <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-[#1A46FD] focus-within:bg-white">
                      <KeyRound className="h-4 w-4 text-slate-400" />
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter your password"
                        className="w-full rounded-2xl bg-transparent px-3 py-3.5 text-sm text-slate-900 outline-none"
                        autoComplete="current-password"
                        required
                      />
                    </div>
                  </div>

                  {error ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                      {error}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1A46FD] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#1232B8] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span>{isSubmitting ? 'Signing in...' : 'Open school portal'}</span>
                    {!isSubmitting ? <ArrowRight className="h-4 w-4" /> : null}
                  </button>
                </form>

                <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-800">Administrator reminder</p>
                  <p className="mt-1 leading-6">
                    Use the real account created in your database. If needed, you can manage users and passwords from the backend administrator tools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
