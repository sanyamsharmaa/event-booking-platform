'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { EventItem, ArtistItem } from '@/types';
import { fetchEvents, fetchSearchArtists } from '@/lib/api';
import { 
  Sparkles, 
  MapPin, 
  Search, 
  Ticket, 
  PlusCircle, 
  User, 
  LogOut, 
  Menu, 
  X,
  Flame,
  ArrowRight,
  Music,
  Mic2,
  Calendar
} from 'lucide-react';

const CITIES = ['All', 'Mumbai', 'Delhi NCR', 'Bengaluru', 'Goa', 'Hyderabad', 'Pune', 'Kolkata'];

export const Navbar: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    isArtist, 
    logout, 
    searchQuery, 
    setSearchQuery, 
    setSearchedArtists,
    clearSearch
  } = useAuth();
  
  const pathname = usePathname();
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('All');
  const [inputValue, setInputValue] = useState(searchQuery || '');

  // Live suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedEvents, setSuggestedEvents] = useState<EventItem[]>([]);
  const [suggestedArtists, setSuggestedArtists] = useState<ArtistItem[]>([]);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Synchronize local input if global search query changes
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced live suggestions query while typing
  useEffect(() => {
    const term = inputValue.trim();
    if (!term || term.length < 1) {
      setSuggestedEvents([]);
      setSuggestedArtists([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSuggesting(true);
      try {
        const [eventsData, artistsData] = await Promise.all([
          fetchEvents({ search: term, location: 'All', category: 'All' }),
          fetchSearchArtists(term)
        ]);

        setSuggestedEvents(eventsData.slice(0, 4));
        setSuggestedArtists(artistsData.slice(0, 4));
        setShowSuggestions(true);
      } catch (err) {
        console.error('Error fetching search suggestions:', err);
      } finally {
        setIsSuggesting(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Execute Search (Enter key or button click)
  const executeSearch = async (term: string) => {
    const cleanTerm = term.trim();
    setShowSuggestions(false);

    if (!cleanTerm) {
      clearSearch();
      return;
    }

    setSearchQuery(cleanTerm);

    // Call search-artists concurrently to populate global state
    try {
      const artists = await fetchSearchArtists(cleanTerm);
      setSearchedArtists(artists);
    } catch (err) {
      console.error('Error in search-artists:', err);
    }

    // If not already on /events, navigate there
    if (pathname !== '/events') {
      router.push('/events');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(inputValue);
  };

  const handleSelectArtistSuggestion = (artistName: string) => {
    setInputValue(artistName);
    executeSearch(artistName);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-cyan-400 p-0.5 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#07080d] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-fuchsia-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight font-sans">
                SHOW<span className="gradient-text-neon">PASS</span>
              </span>
              <span className="text-[10px] tracking-widest text-zinc-400 font-mono -mt-1">LIVE EXPERIENCES</span>
            </div>
          </Link>

          {/* City Selector */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300">
            <MapPin className="w-3.5 h-3.5 text-fuchsia-400" />
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                router.push(`/events?city=${encodeURIComponent(e.target.value)}`);
              }}
              className="bg-transparent text-zinc-200 outline-none cursor-pointer pr-1"
            >
              {CITIES.map((city) => (
                <option key={city} value={city} className="bg-zinc-900 text-white">
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Global Search Bar with Live Suggestions */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-lg relative">
            <form onSubmit={handleFormSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="Search concerts, standup, artists, venues..."
                value={inputValue}
                onFocus={() => {
                  if (inputValue.trim().length > 0) setShowSuggestions(true);
                }}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-10 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all shadow-inner"
              />
              <button
                type="submit"
                aria-label="Submit Search"
                className="absolute left-3.5 top-3 text-zinc-400 hover:text-purple-400 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>

              {inputValue && (
                <button
                  type="button"
                  onClick={() => {
                    setInputValue('');
                    clearSearch();
                    setShowSuggestions(false);
                  }}
                  className="absolute right-3.5 top-3 p-0.5 rounded-full text-zinc-400 hover:text-white"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Live Suggestions Dropdown Popup */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl glass-panel border border-white/15 bg-[#0a0c14]/95 backdrop-blur-2xl shadow-2xl overflow-hidden z-50 divide-y divide-white/10 animate-in fade-in duration-150">
                
                {/* 1. Artist Suggestions */}
                {suggestedArtists.length > 0 && (
                  <div className="p-3 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-400 px-2 flex items-center gap-1.5">
                      <Mic2 className="w-3 h-3" />
                      <span>Artists Found</span>
                    </span>
                    <div className="space-y-1">
                      {suggestedArtists.map((artist) => {
                        const artistPic = artist.img || artist.profilePic;
                        return (
                          <Link
                            key={artist._id}
                            href={`/artist/${artist._id}`}
                            onClick={() => setShowSuggestions(false)}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center text-xs font-bold text-white shadow shrink-0 border border-white/10">
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
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white group-hover:text-fuchsia-300 transition-colors truncate">
                                  {artist.name}
                                </p>
                                {artist.headline && (
                                  <p className="text-[10px] text-zinc-400 line-clamp-1 truncate">{artist.headline}</p>
                                )}
                              </div>
                            </div>
                            <span className="text-[10px] font-semibold text-zinc-400 group-hover:text-fuchsia-400 flex items-center gap-0.5 shrink-0">
                              <span>View Profile</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Event Suggestions */}
                {suggestedEvents.length > 0 && (
                  <div className="p-3 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 px-2 flex items-center gap-1.5">
                      <Music className="w-3 h-3" />
                      <span>Live Shows</span>
                    </span>
                    <div className="space-y-1">
                      {suggestedEvents.map((evt) => {
                        const minPrice = evt.passTypes && evt.passTypes.length > 0
                          ? Math.min(...evt.passTypes.map((t) => t.price))
                          : null;
                        const primaryDetail = evt.details && evt.details.length > 0 ? evt.details[0] : null;

                        return (
                          <Link
                            key={evt._id}
                            href={`/events/${evt._id}`}
                            onClick={() => setShowSuggestions(false)}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 transition-colors group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                              <img
                                src={evt.img}
                                alt={evt.name}
                                className="w-9 h-9 rounded-lg object-cover bg-zinc-800 shrink-0 border border-white/10"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                                  {evt.name}
                                </p>
                                <p className="text-[10px] text-zinc-400 truncate">
                                  {evt.category} {primaryDetail ? `• ${primaryDetail.city}` : ''}
                                </p>
                              </div>
                            </div>

                            {minPrice !== null && (
                              <span className="text-xs font-black text-white shrink-0">
                                ₹{minPrice}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Loading state or No matches */}
                {isSuggesting && (
                  <div className="p-4 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <span>Searching live events & artists...</span>
                  </div>
                )}

                {!isSuggesting && suggestedEvents.length === 0 && suggestedArtists.length === 0 && (
                  <div className="p-4 text-center text-xs text-zinc-400">
                    No instant previews for &ldquo;{inputValue}&rdquo;. Press Enter to perform full search.
                  </div>
                )}

                {/* Footer Action */}
                <div className="p-2.5 bg-white/5 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-zinc-400">
                    Press <strong className="text-white">Enter</strong> for all results
                  </span>
                  <button
                    type="button"
                    onClick={() => executeSearch(inputValue)}
                    className="flex items-center gap-1 font-bold text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
                  >
                    <span>Search Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/events" 
              className={`text-sm font-medium transition-colors hover:text-fuchsia-400 ${pathname === '/events' ? 'text-fuchsia-400' : 'text-zinc-300'}`}
            >
              Explore Events
            </Link>

            {isAuthenticated && !isArtist && (
              <Link 
                href="/my-bookings" 
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-fuchsia-400 ${pathname === '/my-bookings' ? 'text-fuchsia-400' : 'text-zinc-300'}`}
              >
                <Ticket className="w-4 h-4 text-cyan-400" />
                My Bookings
              </Link>
            )}

            {isArtist && (
              <>
                <Link 
                  href="/artist/my-shows" 
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-fuchsia-400 ${pathname === '/artist/my-shows' ? 'text-fuchsia-400' : 'text-zinc-300'}`}
                >
                  <Ticket className="w-4 h-4 text-fuchsia-400" />
                  My Listed Shows
                </Link>

                <Link 
                  href="/artist/add-event" 
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/20 transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-fuchsia-400" />
                  + List Show
                </Link>
              </>
            )}
          </nav>

          {/* Auth State & Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 pl-2 py-1 pr-2 rounded-full bg-white/5 border border-white/10">
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold uppercase text-white shadow shrink-0 border border-white/10">
                    {user.img || user.profilePic ? (
                      <img
                        src={user.img || user.profilePic}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span>{user.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex flex-col pr-1">
                    <span className="text-xs font-semibold text-zinc-200 leading-tight">{user.name}</span>
                    <span className="text-[9px] uppercase tracking-wider text-purple-400 font-bold">{user.role}</span>
                  </div>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-rose-400 transition-colors ml-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/signin"
                  className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 text-sm font-semibold rounded-full gradient-btn-primary shadow-lg shadow-purple-600/25"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-300"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="sm:hidden glass-panel border-t border-white/10 px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleFormSubmit} className="relative mb-3">
            <input
              type="text"
              placeholder="Search shows, artists..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          </form>

          <Link
            href="/events"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-200 hover:bg-white/10"
          >
            Explore Events
          </Link>

          {isAuthenticated && !isArtist && (
            <Link
              href="/my-bookings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-200 hover:bg-white/10"
            >
              My Bookings
            </Link>
          )}

          {isArtist && (
            <>
              <Link
                href="/artist/my-shows"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-fuchsia-300 hover:bg-fuchsia-500/20"
              >
                My Listed Shows
              </Link>
              <Link
                href="/artist/add-event"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-fuchsia-300 hover:bg-fuchsia-500/20"
              >
                + List New Show
              </Link>
            </>
          )}

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0 border border-white/10">
                    {user.img || user.profilePic ? (
                      <img
                        src={user.img || user.profilePic}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span>{user.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-zinc-400 capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 w-full">
                <Link
                  href="/signin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-semibold rounded-lg bg-white/10 text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-semibold rounded-lg gradient-btn-primary"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
