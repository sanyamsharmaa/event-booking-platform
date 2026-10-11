'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { BookingItem, EventItem } from '@/types';
import { fetchMyBookings } from '@/lib/api';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  QrCode, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  Download,
  AlertCircle
} from 'lucide-react';

export default function MyBookingsPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isArtist, isLoading } = useAuth();
  
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/signin?redirect=/my-bookings');
        return;
      }
      if (isArtist) {
        router.push('/artist/my-shows');
        return;
      }
    }

    async function loadBookings() {
      if (token && user) {
        setLoading(true);
        try {
          const data = await fetchMyBookings(token, user.id);
          setBookings(data);
        } catch (err) {
          console.error('Error loading bookings:', err);
        } finally {
          setLoading(false);
        }
      }
    }

    if (token && user) {
      loadBookings();
    }
  }, [token, user, isAuthenticated, isLoading, router]);

  if (isLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-400">Loading your tickets & passes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Ticket className="w-3.5 h-3.5" />
            <span>Digital Ticket Wallet</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            My Event Passes ({bookings.length})
          </h1>
        </div>

        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold gradient-btn-primary shadow-lg"
        >
          <span>Discover More Events</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Bookings List */}
      {bookings.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bookings.map((booking) => {
            const eventObj = typeof booking.eventId === 'object' ? (booking.eventId as EventItem) : null;
            const eventName = eventObj?.name || 'Live Tour Event';
            const eventImg = eventObj?.img || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800';
            
            const eventDate = new Date(booking.date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              weekday: 'short'
            });

            return (
              <div
                key={booking._id}
                className="rounded-3xl overflow-hidden glass-panel border border-white/10 relative shadow-2xl flex flex-col sm:flex-row"
              >
                {/* Left Ticket Stub / Visual */}
                <div className="sm:w-2/5 relative min-h-[160px] sm:min-h-full bg-zinc-900 overflow-hidden">
                  <img
                    src={eventImg}
                    alt={eventName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
                      {booking.passType} Pass
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] text-zinc-300 uppercase tracking-wider font-semibold block">Pass Quantity</span>
                    <span className="text-xl font-black">{booking.tktCount} Admit</span>
                  </div>
                </div>

                {/* Right Ticket Info & QR Code */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4 bg-gradient-to-br from-white/5 to-transparent">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirmed & Active</span>
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        #{booking._id.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white leading-tight line-clamp-1">
                      {eventName}
                    </h3>

                    <div className="space-y-1 text-xs text-zinc-300 pt-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
                        <span>{eventDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate max-w-[220px]">{booking.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* QR Entry Pass Code */}
                  <div className="pt-3 border-t border-dashed border-white/15 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white text-black shadow">
                        <QrCode className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 block">Entry Code</span>
                        <span className="text-xs font-mono font-bold text-white tracking-widest">
                          SP-{booking._id.slice(-4).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => alert(`Showing QR Pass for booking #${booking._id}`)}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                      title="View Full Pass"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 px-4 rounded-3xl glass-panel border border-white/10 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-zinc-400">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">No Tickets Booked Yet</h3>
          <p className="text-xs sm:text-sm text-zinc-400">
            Explore our curated selection of concerts, comedy tours, and festivals to book your first live experience.
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold gradient-btn-primary shadow-lg"
          >
            <span>Browse Live Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

    </div>
  );
}
