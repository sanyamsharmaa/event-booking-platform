'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { BannerItem, EventItem } from '@/types';
import { 
  fetchBanners, 
  fetchTrendingShows, 
  fetchRecommendedShows, 
  fetchEvents 
} from '@/lib/api';
import { HeroCarousel } from '@/components/HeroCarousel';
import { EventCard } from '@/components/EventCard';
import { FilterBar } from '@/components/FilterBar';
import { 
  Flame, 
  Sparkles, 
  Compass, 
  TrendingUp, 
  Music, 
  Mic2, 
  PartyPopper, 
  Drama, 
  Trophy,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users
} from 'lucide-react';

const CATEGORY_SHORTCUTS = [
  { name: 'Music', icon: Music, gradient: 'from-purple-600 to-indigo-600' },
  { name: 'Comedy', icon: Mic2, gradient: 'from-fuchsia-600 to-pink-600' },
  { name: 'Nightlife', icon: PartyPopper, gradient: 'from-cyan-600 to-blue-600' },
  { name: 'Theatre', icon: Drama, gradient: 'from-amber-500 to-orange-600' },
  { name: 'Sports', icon: Trophy, gradient: 'from-emerald-500 to-teal-600' },
];

export default function HomePage() {
  const { user, token, isAuthenticated, searchQuery, clearSearch } = useAuth();
  
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [trending, setTrending] = useState<EventItem[]>([]);
  const [recommended, setRecommended] = useState<EventItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [category, setCategory] = useState('All');
  const [city, setCity] = useState('All');
  const [date, setDate] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [bannersData, trendingData, allEventsData] = await Promise.all([
          fetchBanners(),
          fetchTrendingShows(),
          fetchEvents({ location: 'All', category: 'All' })
        ]);

        setBanners(bannersData);
        setTrending(trendingData);
        setEvents(allEventsData);

        if (token) {
          const recData = await fetchRecommendedShows(token);
          setRecommended(recData);
        }
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [token]);

  // Handle filter changes
  const applyFilters = async () => {
    try {
      const data = await fetchEvents({
        location: city,
        category,
        date,
        search: searchQuery
      });
      setEvents(data);
    } catch (err) {
      console.error('Error applying filters:', err);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [category, city, date, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* 1. Hero Tour Carousel */}
      <section>
        <HeroCarousel banners={banners} />
      </section>

      {/* 2. Quick Category Tiles */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-fuchsia-400" />
            <span>Explore by Genre</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {CATEGORY_SHORTCUTS.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => setCategory(cat.name)}
                className={`group p-4 rounded-2xl glass-panel glass-panel-hover flex flex-col items-center justify-center gap-3 text-center transition-all ${
                  category === cat.name ? 'border-fuchsia-500 bg-white/10' : ''
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Trending & Hot Selling Shows */}
      {trending.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Flame className="w-3 h-3 fill-amber-400" />
                <span>Fastest Selling</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Trending Events
              </h2>
            </div>
            <Link 
              href="/events"
              className="flex items-center gap-1 text-xs sm:text-sm font-bold text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trending.slice(0, 3).map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* 4. Personalized Recommendations (Logged-In User) */}
      {isAuthenticated && recommended.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Tailored For You</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Recommended For {user?.name}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommended.slice(0, 4).map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Main All Events Catalog Section */}
      <section id="events-section">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              Upcoming Live Shows & Festivals
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Find verified tickets for tours, arena concerts, and comedy clubs across India
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          category={category}
          setCategory={setCategory}
          city={city}
          setCity={setCity}
          date={date}
          setDate={setDate}
          onFilterChange={applyFilters}
        />

        {/* Event Grid / Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-80 rounded-2xl glass-panel animate-pulse p-4 flex flex-col justify-between">
                <div className="w-full h-44 rounded-xl bg-white/5" />
                <div className="space-y-2 mt-4">
                  <div className="w-3/4 h-5 rounded bg-white/5" />
                  <div className="w-1/2 h-4 rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-3xl glass-panel border border-white/10 space-y-4">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto text-zinc-400">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">No shows found</h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
              We couldn't find any events matching your selected filters. Try changing your search query, city, or date.
            </p>
            <button
              onClick={() => {
                setCategory('All');
                setCity('All');
                setDate('');
                clearSearch();
              }}
              className="px-5 py-2 text-xs font-bold rounded-full gradient-btn-primary"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* 6. Live Stats Banner */}
      <section className="p-8 sm:p-12 rounded-3xl glass-panel border border-white/10 bg-gradient-to-r from-purple-900/20 via-black to-cyan-900/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <span className="text-2xl sm:text-4xl font-black text-white gradient-text-neon block">500,000+</span>
            <span className="text-xs sm:text-sm font-semibold text-zinc-400 mt-1 block">Tickets Booked</span>
          </div>
          <div>
            <span className="text-2xl sm:text-4xl font-black text-white gradient-text-neon block">1,200+</span>
            <span className="text-xs sm:text-sm font-semibold text-zinc-400 mt-1 block">Live Concerts</span>
          </div>
          <div>
            <span className="text-2xl sm:text-4xl font-black text-white gradient-text-neon block">25+</span>
            <span className="text-xs sm:text-sm font-semibold text-zinc-400 mt-1 block">Major Cities</span>
          </div>
          <div>
            <span className="text-2xl sm:text-4xl font-black text-white gradient-text-neon block">99.9%</span>
            <span className="text-xs sm:text-sm font-semibold text-zinc-400 mt-1 block">Satisfied Attendees</span>
          </div>
        </div>
      </section>

    </div>
  );
}
