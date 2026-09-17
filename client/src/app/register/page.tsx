'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRegister } from '@/lib/api';
import { Sparkles, User, Mic2, ArrowRight, AlertCircle, Check } from 'lucide-react';

const AVAILABLE_INTERESTS = [
  'Music',
  'Comedy',
  'EDM & DJ',
  'Rock & Metal',
  'Bollywood',
  'Theatre',
  'Sports',
  'Workshops'
];

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<'user' | 'artist'>('user');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [mail, setMail] = useState('');
  const [pass, setPass] = useState('');
  const [headline, setHeadline] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Music', 'Comedy']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile || !mail || !pass) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (role === 'user' && selectedInterests.length === 0) {
      setErrorMsg('Please choose at least one interest genre.');
      return;
    }

    if (role === 'artist' && !headline.trim()) {
      setErrorMsg('Please provide your artist headline / genre.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await apiRegister({
        name,
        mobile,
        mail,
        pass,
        role,
        interestArr: role === 'user' ? selectedInterests : undefined,
        headline: role === 'artist' ? headline : undefined,
        img: role === 'artist' && profilePic.trim() ? profilePic.trim() : undefined,
        profilePic: role === 'artist' && profilePic.trim() ? profilePic.trim() : undefined,
      });

      if (res.success) {
        setSuccessMsg('🎉 Account created successfully! Redirecting to sign in...');
        setTimeout(() => {
          router.push('/signin');
        }, 1500);
      } else {
        setErrorMsg(res.msg || 'Registration failed. Please check your details.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg p-8 sm:p-10 rounded-3xl glass-panel border border-white/10 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-cyan-400 p-0.5 mx-auto shadow-lg shadow-purple-500/25">
            <div className="w-full h-full bg-[#07080d] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-fuchsia-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Create Account</h1>
          <p className="text-xs text-zinc-400">Join ShowPass to explore & book exclusive live experiences</p>
        </div>

        {/* Role Switcher */}
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
            <span>I want to Book Shows (Attendee)</span>
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
            <span>I am an Artist / Host</span>
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sanyam Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Mobile Number
              </label>
              <input
                type="tel"
                required
                placeholder="10-digit number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. sanyam@example.com"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="Min. 6 characters"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Role specific inputs */}
          {role === 'user' ? (
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                Select Your Favorite Genres (for Personalized Feed)
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_INTERESTS.map((interest) => {
                  const isChecked = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 border ${
                        isChecked
                          ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                          : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 text-purple-400" />}
                      <span>{interest}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Artist Headline / Stage Tag *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electronic Music Producer & Live Performer"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Profile Picture URL (Image Link)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    placeholder="e.g. https://images.unsplash.com/photo-..."
                    value={profilePic}
                    onChange={(e) => setProfilePic(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                  />
                  {profilePic.trim() && (
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-800 border border-purple-500/40 shrink-0">
                      <img
                        src={profilePic}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500">
                  This picture will be featured before your artist name across search, event cards, and artist listings.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
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
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400">
          Already have an account?{' '}
          <Link href="/signin" className="font-bold text-fuchsia-400 hover:text-fuchsia-300 underline">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}
