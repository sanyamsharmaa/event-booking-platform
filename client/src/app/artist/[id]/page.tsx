'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { ArtistItem } from '@/types';
import { fetchArtistProfile, fetchSearchArtists } from '@/lib/api';
import { EventCard } from '@/components/EventCard';
import { 
  Sparkles, 
  Mic2, 
  Music, 
  Calendar, 
  Ticket, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  Flame, 
  Radio, 
  Share2, 
  Check
} from 'lucide-react';

export default function ArtistProfilePage() {
  const params = useParams();
  const artistId = params.id as string;
  const router = useRouter();

  const { setSearchQuery, setSearchedArtists } = useAuth();

  const [artist, setArtist] = useState<ArtistItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadArtist() {
      if (!artistId) return;
      setLoading(true);
      setErrorMsg('');

      try {
        const res = await fetchArtistProfile(artistId);
        if (res.success && res.data) {
          setArtist(res.data);
        } else {
          setErrorMsg(res.msg || 'Artist profile could not be found.');
        }
      } catch (err: any) {
        console.error('Error loading artist profile:', err);
        setErrorMsg(err.message || 'Error occurred while loading artist profile.');
      } finally {
        setLoading(false);
      }
    }

    loadArtist();
  }, [artistId]);

  // Explore Artist's Events Handler
  const handleExploreEvents = async () => {
    if (!artist) return;

    const targetName = artist.name.trim();
    // Update global search query in authContext
    setSearchQuery(targetName);

    // Concurrently fetch / update searched artists state for clean consistency
    try {
      const matched = await fetchSearchArtists(targetName);
      setSearchedArtists(matched.length > 0 ? matched : [artist]);
    } catch {
      setSearchedArtists([artist]);
    }

    // Redirect to events page where filtered events will load
    router.push('/events');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-28 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-zinc-400 text-sm font-medium">Loading artist profile & tour dates...</p>
      </div>
    );
  }

  if (errorMsg || !artist) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
          <Mic2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Artist Not Found</h2>
        <p className="text-zinc-400 text-sm">
          {errorMsg || 'The artist you are looking for does not exist or has been removed.'}
        </p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full gradient-btn-primary text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore All Live Events</span>
        </Link>
      </div>
    );
  }

  const artistPic = artist.img || artist.profilePic;
  const eventsCount = artist.events ? artist.events.length : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Back to Events Nav */}
      <div className="flex items-center justify-between">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-zinc-400" />}
          <span>{copied ? 'Link Copied!' : 'Share Profile'}</span>
        </button>
      </div>

      {/* 1. Artist Hero Header Card */}
      <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-white/10 relative overflow-hidden bg-gradient-to-r from-purple-950/40 via-[#07080d] to-fuchsia-950/40 shadow-2xl">
        
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          
          {/* Avatar / Profile Picture */}
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-cyan-400 p-1 shrink-0 shadow-2xl shadow-purple-500/30 group">
            <div className="w-full h-full bg-[#07080d] rounded-[22px] overflow-hidden flex items-center justify-center text-4xl font-black text-white relative">
              {artistPic ? (
                <img
                  src={artistPic}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="gradient-text-neon">{artist.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>

          {/* Artist Bio & Headline Info */}
          <div className="space-y-4 flex-1 text-center md:text-left">
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-xs font-bold uppercase tracking-wider border border-fuchsia-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>Verified Official Artist</span>
              </span>

              {eventsCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider border border-cyan-500/30">
                  <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>On Tour Now</span>
                </span>
              )}
            </div>

            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {artist.name}
              </h1>
              <p className="text-base sm:text-lg font-semibold text-fuchsia-300/90 mt-1">
                {artist.headline || 'Performing Artist & Headline Creator'}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Official live performance hub and booking portal for {artist.name}. Discover upcoming arena concerts, comedy specials, club appearances, and purchase verified passes directly with zero resale markup.
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2 border-t border-white/10 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-fuchsia-400" />
                <span>
                  <strong className="text-white font-bold">{eventsCount}</strong> Active Shows
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>
                  <strong className="text-white font-bold">{artist.stats || '50K+'}</strong> Monthly Attendees
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>
                  <strong className="text-white font-bold">100%</strong> Live Certified
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 2. Listed / Upcoming Tour Shows Section */}
      <section className="space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Music className="w-5 h-5 text-fuchsia-400" />
              <span>Upcoming Shows by {artist.name}</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Select any live tour date or city to book entry passes directly.
            </p>
          </div>

          {eventsCount > 0 && (
            <button
              onClick={handleExploreEvents}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all self-start sm:self-auto"
            >
              <span>View in Events Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {eventsCount > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {artist.events?.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-3xl glass-panel border border-white/10 text-center space-y-3 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-400 mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No active tour dates right now</h3>
            <p className="text-xs text-zinc-400">
              {artist.name} does not have any publicly listed tour dates scheduled at this moment. Click below to explore other live shows or check back soon!
            </p>
          </div>
        )}

      </section>

      {/* 3. Prominent Bottom Action Banner */}
      <div className="p-8 sm:p-10 rounded-3xl glass-panel border border-fuchsia-500/30 bg-gradient-to-r from-purple-900/40 via-fuchsia-900/30 to-cyan-900/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1.5 text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Ready to experience {artist.name} live on stage?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300">
            Browse all venue locations, pass tiers, VIP perks, and instant Razorpay bookings.
          </p>
        </div>

        <button
          onClick={handleExploreEvents}
          className="px-8 py-4 rounded-2xl font-black text-sm gradient-btn-primary shadow-2xl shadow-purple-600/40 flex items-center gap-3 whitespace-nowrap hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Explore {artist.name}&apos;s Events</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
