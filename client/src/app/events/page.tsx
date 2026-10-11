'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { EventItem, ArtistItem } from '@/types';
import { fetchEvents, fetchSearchArtists } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import { EventCard } from '@/components/EventCard';
import { FilterBar } from '@/components/FilterBar';
import { Sparkles, Calendar, Compass, Mic2, Music, X, Search, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';

function EventsContent() {
  const searchParams = useSearchParams();
  const urlCity = searchParams.get('city');

  const { 
    searchQuery, 
    setSearchQuery, 
    searchedArtists, 
    setSearchedArtists, 
    clearSearch 
  } = useAuth();

  const [category, setCategory] = useState('All');
  const [city, setCity] = useState(urlCity || 'All');
  const [date, setDate] = useState('');
  
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // When global searchQuery updates, reset other filters and query both APIs concurrently
  useEffect(() => {
    if (searchQuery) {
      setCategory('All');
      setCity('All');
      setDate('');
    }
  }, [searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (searchQuery) {
        // Dual API call concurrently for events and artists
        const [eventsData, artistsData] = await Promise.all([
          fetchEvents({
            location: city,
            category,
            date,
            search: searchQuery
          }),
          fetchSearchArtists(searchQuery)
        ]);

        setEvents(eventsData);
        setSearchedArtists(artistsData);
      } else {
        // Regular filtered events query
        const data = await fetchEvents({
          location: city,
          category,
          date,
          search: ''
        });
        setEvents(data);
      }
    } catch (err) {
      console.error('Error fetching events/artists data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [category, city, date, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl glass-panel border border-white/10 relative overflow-hidden bg-gradient-to-r from-purple-950/40 via-[#07080d] to-cyan-950/40">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Box Office</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {searchQuery ? (
              <>Search Results for &ldquo;{searchQuery}&rdquo;</>
            ) : (
              <>Discover Live Events & Shows</>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 mt-2">
            {searchQuery 
              ? 'Browse matched headline artists and upcoming live shows matching your search query.'
              : 'Explore live concerts, standup comedy tours, music festivals, club events, and exclusive passes across India.'}
          </p>
        </div>
      </div>

      {/* Active Search Result Tag Bar */}
      {searchQuery && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 to-fuchsia-900/20 border border-purple-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Filtered by keyword: <span className="gradient-text-neon">&ldquo;{searchQuery}&rdquo;</span>
              </p>
              <p className="text-xs text-zinc-400">
                Found {searchedArtists.length} artists and {events.length} live shows
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              clearSearch();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Clear Search</span>
          </button>
        </div>
      )}

      {/* 1. Found Artists Section (When Search is Active) */}
      {searchQuery && searchedArtists.length > 0 && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Mic2 className="w-4 h-4 text-fuchsia-400" />
              <span>Matched Artists ({searchedArtists.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchedArtists.map((artist) => {
              const artistPic = artist.img || artist.profilePic;
              return (
                <Link
                  key={artist._id}
                  href={`/artist/${artist._id}`}
                  className="p-4 rounded-2xl glass-panel border border-white/10 flex items-center justify-between gap-4 hover:border-fuchsia-500/50 hover:bg-white/5 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-cyan-400 p-0.5 shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      <div className="w-full h-full bg-[#07080d] rounded-[14px] overflow-hidden flex items-center justify-center text-sm font-black text-white">
                        {artistPic ? (
                          <img
                            src={artistPic}
                            alt={artist.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span>{artist.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white group-hover:text-fuchsia-300 transition-colors truncate">
                        {artist.name}
                      </h4>
                      <p className="text-xs text-zinc-400 truncate">
                        {artist.headline || 'Verified Artist'}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1.5 rounded-lg bg-white/5 group-hover:bg-fuchsia-600 text-zinc-300 group-hover:text-white text-[11px] font-bold transition-all whitespace-nowrap flex items-center gap-1">
                    <span>View Profile</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Filter Component */}
      <FilterBar
        category={category}
        setCategory={setCategory}
        city={city}
        setCity={setCity}
        date={date}
        setDate={setDate}
        onFilterChange={loadData}
      />

      {/* Events Results Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <p className="text-sm font-semibold text-zinc-300">
          Showing <span className="text-white font-bold">{events.length}</span> {category !== 'All' ? category : ''} events {city !== 'All' ? `in ${city}` : 'across India'}
        </p>
      </div>

      {/* Event Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 rounded-2xl glass-panel animate-pulse p-4" />
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 rounded-3xl glass-panel border border-white/10 space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-zinc-400">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">No matching events found</h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            {searchQuery 
              ? `We couldn't find any shows matching "${searchQuery}". Try a different artist, tour name, or genre.`
              : 'Try adjusting your category, city, or date filters to see available shows.'}
          </p>
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="px-5 py-2.5 rounded-full text-xs font-bold gradient-btn-primary"
            >
              Reset Search & Show All Events
            </button>
          )}
        </div>
      )}

    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-zinc-400">Loading events...</div>}>
      <EventsContent />
    </Suspense>
  );
}
