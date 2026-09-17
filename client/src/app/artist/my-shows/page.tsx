'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { EventItem } from '@/types';
import { fetchArtistShows, apiDeleteEvent } from '@/lib/api';
import { 
  Sparkles, 
  PlusCircle, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  Ticket, 
  Users, 
  Search,
  Flame,
  AlertTriangle,
  CheckCircle,
  LayoutDashboard
} from 'lucide-react';

export default function ArtistShowsPage() {
  const router = useRouter();
  const { user, token, isArtist, isAuthenticated, isLoading } = useAuth();

  const [shows, setShows] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/signin?redirect=/artist/my-shows');
      } else if (!isArtist) {
        router.push('/');
      }
    }
  }, [isAuthenticated, isArtist, isLoading, router]);

  const loadShows = async () => {
    if (token) {
      setLoading(true);
      try {
        const data = await fetchArtistShows(token);
        setShows(data);
      } catch (err: any) {
        console.error('Error fetching artist shows:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (token && isArtist) {
      loadShows();
    }
  }, [token, isArtist]);

  const handleDelete = async (eventId: string) => {
    if (!token) return;
    setDeleting(true);
    setMsg(null);

    try {
      const res = await apiDeleteEvent(eventId, token);
      if (res.success) {
        setShows((prev) => prev.filter((s) => s._id !== eventId));
        setMsg({ type: 'success', text: 'Show deleted successfully from database & Redis cache.' });
        setDeleteId(null);
      } else {
        setMsg({ type: 'error', text: res.msg || 'Failed to delete show.' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error occurred while deleting.' });
    } finally {
      setDeleting(false);
    }
  };

  // Metrics Calculations
  const totalShows = shows.length;
  const totalCapacity = shows.reduce((sum, show) => {
    const showCap = show.passTypes?.reduce((tSum, p) => tSum + (p.tktCount || 0), 0) || 0;
    return sum + showCap;
  }, 0);
  const uniqueCities = new Set(
    shows.flatMap((s) => s.details?.map((d) => d.city) || [])
  ).size;

  const filteredShows = shows.filter((s) => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.artists?.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-400">Loading your listed shows & tours...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl glass-panel border border-white/10 relative overflow-hidden bg-gradient-to-r from-purple-950/40 via-[#07080d] to-fuchsia-950/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 flex items-center gap-5 max-w-xl">
          {user?.img || user?.profilePic ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-fuchsia-500/40 shrink-0 shadow-lg shadow-purple-500/20 bg-zinc-900">
              <img
                src={user.img || user.profilePic}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-xs font-bold uppercase tracking-wider mb-2">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Artist Live Management</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {user?.name ? `${user.name}'s Listed Shows` : 'My Listed Shows & Tours'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Manage your live concert dates, ticket tiers, pricing, and availability.
            </p>
          </div>
        </div>

        <Link
          href="/artist/add-event"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold gradient-btn-primary shadow-xl shadow-purple-600/30 whitespace-nowrap self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ List New Show</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl glass-panel border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white">{totalShows}</span>
            <p className="text-xs text-zinc-400 font-medium">Active Tours Listed</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white">{totalCapacity.toLocaleString()}</span>
            <p className="text-xs text-zinc-400 font-medium">Total Passes Available</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white">{uniqueCities}</span>
            <p className="text-xs text-zinc-400 font-medium">Tour Cities Scheduled</p>
          </div>
        </div>
      </div>

      {/* Notification Message */}
      {msg && (
        <div className={`flex items-center gap-2 p-4 rounded-2xl text-xs font-semibold border ${
          msg.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {msg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder="Filter your shows by name, genre, or artists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      {/* Shows List */}
      {filteredShows.length > 0 ? (
        <div className="space-y-4">
          {filteredShows.map((show) => {
            const minPrice = show.passTypes && show.passTypes.length > 0
              ? Math.min(...show.passTypes.map((t) => t.price))
              : 0;
            const totalTickets = show.passTypes?.reduce((acc, t) => acc + t.tktCount, 0) || 0;

            return (
              <div
                key={show._id}
                className="p-5 sm:p-6 rounded-3xl glass-panel border border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-purple-500/40 transition-all"
              >
                {/* Visual + Main Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-zinc-900 shrink-0 border border-white/10">
                    <img
                      src={show.img}
                      alt={show.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {show.category}
                      </span>
                      {show.hype ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                          <Flame className="w-3 h-3 fill-amber-400" />
                          <span>{show.hype}% Hype</span>
                        </span>
                      ) : null}
                    </div>

                    <h3 className="text-lg font-black text-white truncate leading-snug">
                      {show.name}
                    </h3>

                    {show.artists && (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <Users className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="truncate">{show.artists.join(', ')}</span>
                      </div>
                    )}

                    {/* Show Cities & Dates tags */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-zinc-300">
                      {show.details?.map((d, i) => (
                        <span key={i} className="flex items-center gap-1 text-[11px] bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          <span>{d.city}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tier & Price Overview */}
                <div className="flex flex-wrap items-center gap-6 lg:gap-8 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/10 w-full lg:w-auto justify-between lg:justify-end">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Starts At</span>
                    <span className="text-lg font-black text-white">₹{minPrice}</span>
                  </div>

                  <div className="text-left lg:text-right">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Passes Remaining</span>
                    <span className="text-lg font-black text-cyan-400">{totalTickets}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/events/${show._id}`}
                      target="_blank"
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                      title="View Public Event Page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <Link
                      href={`/artist/edit-event/${show._id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Link>

                    <button
                      onClick={() => setDeleteId(show._id)}
                      className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                      title="Delete Show"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 px-4 rounded-3xl glass-panel border border-white/10 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-zinc-400">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">No Shows Listed Yet</h3>
          <p className="text-xs sm:text-sm text-zinc-400">
            You haven&apos;t published any live tour events or comedy shows yet. List your first show now to start ticketing!
          </p>
          <Link
            href="/artist/add-event"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold gradient-btn-primary shadow-lg"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ List Your First Show</span>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl glass-panel border border-rose-500/30 space-y-4 shadow-2xl bg-[#0d0f17]">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">Confirm Deletion</h3>
              <p className="text-xs text-zinc-400">
                Are you sure you want to remove this show? This will delete the event from MongoDB and clear its Redis live ticket inventory.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Show</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
