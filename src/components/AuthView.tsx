import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ShieldAlert, Check, Loader2 } from 'lucide-react';
import { User } from '../types';

interface AuthViewProps {
  onLoginSuccess: (user: User, token: string) => void;
  onRegisterSuccess: (user: User, token: string) => void;
}

export default function AuthView({ onLoginSuccess, onRegisterSuccess }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin 
      ? { emailOrUsername: email || username, password } 
      : { username, email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed. Please check inputs.');
      }

      // Success handlers
      if (isLogin) {
        onLoginSuccess(data.user, data.token);
      } else {
        onRegisterSuccess(data.user, data.token);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper helper to auto fill demo account
  const handleQuickFill = (role: 'user' | 'admin') => {
    if (role === 'admin') {
      setEmail('admin');
      setPassword('admin123');
    } else {
      setEmail('user');
      setPassword('user123');
    }
    setIsLogin(true);
  };

  return (
    <div id="auth-view" className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        
        {/* Title Block */}
        <div className="text-center mb-8">
          <h2 className="font-sans text-2xl font-extrabold tracking-tight text-slate-900">
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isLogin ? 'Sign in to access your premium cart and track orders.' : 'Sign up to shop premium custom lifestyle accessories.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600 border border-red-100">
            ⚠️ {error}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Username</label>
              <div className="relative mt-1.5">
                <UserIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="modern_curator"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 py-2.5 pr-4 pl-10 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              {isLogin ? 'Email or Username' : 'Email Address'}
            </label>
            <div className="relative mt-1.5">
              <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type={isLogin ? 'text' : 'email'}
                required
                placeholder={isLogin ? 'user or admin' : 'curator@store.com'}
                value={isLogin ? email : email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setUsername(e.target.value);
                }}
                className="w-full rounded-lg border border-slate-200 py-2.5 pr-4 pl-10 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
            <div className="relative mt-1.5">
              <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2.5 pr-4 pl-10 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>

          {/* Action Trigger */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-lg bg-indigo-600 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition active:scale-[0.98] disabled:opacity-50 shadow-indigo-100"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Working...</span>
              </>
            ) : (
              <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
            )}
          </button>
        </form>

        {/* Toggle between Register/Login */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-xs font-semibold text-slate-500 hover:text-indigo-650 underline underline-offset-4 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
          </button>
        </div>

        {/* Testing Info Helper Panel (Required by Goals for simple testing) */}
        <div className="mt-8 rounded-lg bg-slate-50 p-4 border border-slate-200">
          <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
            <ShieldAlert className="h-4 w-4 text-amber-500 animate-pulse" />
            <span>Developer Quick Testing Login</span>
          </h3>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            You can use these pre-loaded accounts to test user/admin specific authorization flows:
          </p>
          
          <div className="mt-3.5 space-y-2 text-xs">
            {/* Customer profile */}
            <div className="flex items-center justify-between rounded-lg bg-white p-2 border border-slate-100">
              <div>
                <span className="font-bold text-slate-800">Standard Customer</span>
                <p className="text-[10px] text-slate-400 font-medium">User: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">user</code> | Pass: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">user123</code></p>
              </div>
              <button
                onClick={() => handleQuickFill('user')}
                className="rounded-lg bg-indigo-600 px-3 py-1 text-[10px] font-bold text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/10 transition-colors"
              >
                Auto Fill
              </button>
            </div>

            {/* Admin profile */}
            <div className="flex items-center justify-between rounded-lg bg-white p-2 border border-slate-100">
              <div>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  Admin Manager
                </span>
                <p className="text-[10px] text-slate-400 font-medium">User: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">admin</code> | Pass: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">admin123</code></p>
              </div>
              <button
                onClick={() => handleQuickFill('admin')}
                className="rounded-lg bg-indigo-600 px-3 py-1 text-[10px] font-bold text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/10 transition-colors"
              >
                Auto Fill
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
