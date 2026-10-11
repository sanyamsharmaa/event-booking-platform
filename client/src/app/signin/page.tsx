'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { apiSignIn } from '@/lib/api';
import { Sparkles, User, Mic2, Lock, ArrowRight, AlertCircle, Check } from 'lucide-react';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const { login } = useAuth();

  const [role, setRole] = useState<'user' | 'artist'>('user');
  const [cred, setCred] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cred || !pass) {
      setErrorMsg('Please enter both your credentials and password.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await apiSignIn(cred, pass, role);

      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        router.push(redirectUrl);
      } else {
        setErrorMsg(res.msg || 'Invalid credentials. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to sign in. Please verify your backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl glass-panel border border-white/10 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-cyan-400 p-0.5 mx-auto shadow-lg shadow-purple-500/25">
            <div className="w-full h-full bg-[#07080d] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-fuchsia-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Welcome Back</h1>
          <p className="text-xs text-zinc-400">Sign in to manage your tickets, bookings & events</p>
        </div>

        {/* Role Toggle */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/5 border border-white/10">
          <button
            type="button"
            onClick={() => setRole('user')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              role === 'user'
                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Attendee</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('artist')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              role === 'artist'
                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>Artist / Host</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Email or Mobile Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. john@example.com or 9876543210"
              value={cred}
              onChange={(e) => setCred(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Password
              </label>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-colors"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm gradient-btn-primary shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In as {role === 'user' ? 'Attendee' : 'Artist'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-zinc-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-bold text-fuchsia-400 hover:text-fuchsia-300 underline">
            Create Account
          </Link>
        </p>

      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-zinc-400">Loading sign in...</div>}>
      <SignInContent />
    </Suspense>
  );
}
