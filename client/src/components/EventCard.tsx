import React from 'react';
import Link from 'next/link';
import { EventItem } from '@/types';
import { Calendar, MapPin, Flame, Ticket, Users } from 'lucide-react';

interface EventCardProps {
  event: EventItem;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  // Find minimum price among tiers
  const minPrice = event.passTypes && event.passTypes.length > 0
    ? Math.min(...event.passTypes.map((t) => t.price))
    : 499;

  // Get next available show detail
  const primaryDetail = event.details && event.details.length > 0 ? event.details[0] : null;
  const formattedDate = primaryDetail && primaryDetail.date
    ? new Date(primaryDetail.date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        weekday: 'short',
      })
    : 'Upcoming Dates';

  const defaultImg = 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=800&auto=format&fit=crop';

  return (
    <Link
      href={`/events/${event._id}`}
      className="group flex flex-col rounded-2xl overflow-hidden glass-panel glass-panel-hover transition-all duration-300 relative border border-white/10"
    >
      {/* Poster Image Container */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-zinc-900">
        <img
          src={event.img || defaultImg}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImg;
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-zinc-200 border border-white/10">
            {event.category || 'Live Show'}
          </span>

          {event.hype && event.hype > 0 ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
              <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{event.hype}% Hype</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-md">
              <Ticket className="w-3 h-3" />
              <span>Fast Filling</span>
            </span>
          )}
        </div>

        {/* Venue & City Tag */}
        {primaryDetail && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-zinc-300">
            <div className="flex items-center gap-1.5 bg-[#07080d]/80 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate max-w-[160px]">{primaryDetail.city} • {primaryDetail.venue}</span>
            </div>
            <div className="flex items-center gap-1 bg-[#07080d]/80 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10 text-fuchsia-300 font-semibold">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug group-hover:text-fuchsia-300 transition-colors line-clamp-1">
            {event.name}
          </h3>

          {event.artists && event.artists.length > 0 && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-400">
              <Users className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="truncate">{event.artists.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Footer & Price */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Starts From</span>
            <span className="text-base sm:text-lg font-black text-white">
              ₹{minPrice}
            </span>
          </div>

          <button className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-white group-hover:gradient-btn-primary transition-all">
            Book Pass
          </button>
        </div>
      </div>
    </Link>
  );
};
