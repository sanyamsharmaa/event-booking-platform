'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { apiAddEvent } from '@/lib/api';
import { 
  PlusCircle, 
  Trash2, 
  MapPin, 
  Calendar, 
  Ticket, 
  Sparkles, 
  ArrowLeft,
  Check,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface DetailRow {
  city: string;
  date: string;
  venue: string;
}

interface TierRow {
  tier: string;
  price: number;
  tktCount: number;
}

const CATEGORIES = [
  'Music',
  'Comedy',
  'Concert',
  'Nightlife',
  'Theatre',
  'Sports',
  'Workshops'
];

export const PRESET_CITIES = [
  { city: 'Mumbai', venue: 'MMRDA Grounds, BKC' },
  { city: 'Delhi', venue: 'Jawaharlal Nehru Stadium' },
  { city: 'Bengaluru', venue: 'Bengaluru Palace Grounds' },
  { city: 'Hyderabad', venue: 'Gachibowli Stadium' },
  { city: 'Ahmedabad', venue: 'Narendra Modi Stadium' },
  { city: 'Pune', venue: 'Mahalaxmi Lawns, Kharadi' },
  { city: 'Chennai', venue: 'YMCA Grounds, Nandanam' },
  { city: 'Kolkata', venue: 'Biswa Bangla Mela Prangan' },
  { city: 'Jaipur', venue: 'JECC / Jaipur Exhibition & Convention Centre' },
  { city: 'Lucknow', venue: 'Bharat Ratna Shri Atal Bihari Vajpayee Ekana Stadium' },
  { city: 'Gurugram', venue: 'Leisure Valley Ground' },
  { city: 'Chandigarh', venue: 'Sector 34 Ground' },
  { city: 'Indore', venue: 'Holkar Stadium / large-event grounds' },
  { city: 'Kochi', venue: 'Jawaharlal Nehru International Stadium' },
  { city: 'Bhubaneswar', venue: 'Kalinga Stadium / event grounds' },
];

export const CITY_VENUE_MAP: Record<string, string> = PRESET_CITIES.reduce((acc, curr) => {
  acc[curr.city] = curr.venue;
  return acc;
}, {} as Record<string, string>);

// Helper to get today's date in YYYY-MM-DD format
const getTodayISO = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Converts from DD-MM-YYYY to YYYY-MM-DD for <input type="date">
const toInputDateFormat = (dmy: string): string => {
  if (!dmy) return '';
  if (dmy.includes('-')) {
    const parts = dmy.split('-');
    if (parts[0].length === 2 && parts[2]?.length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    if (parts[0].length === 4) {
      return dmy;
    }
  }
  return '';
};

// Converts from YYYY-MM-DD (from input) to DD-MM-YYYY (for API/state)
const toDisplayDateFormat = (ymd: string): string => {
  if (!ymd) return '';
  if (ymd.includes('-')) {
    const parts = ymd.split('-');
    if (parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }
  return ymd;
};

export default function AddEventPage() {
  const router = useRouter();
  const { user, token, isArtist, isLoading, isAuthenticated } = useAuth();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Music');
  const [img, setImg] = useState('');
  const [artistsText, setArtistsText] = useState('');
  const [desp, setDesp] = useState('');

  // Tour dates with preset defaults
  const [details, setDetails] = useState<DetailRow[]>([
    { 
      city: 'Mumbai', 
      date: toDisplayDateFormat(getTodayISO()), 
      venue: 'MMRDA Grounds, BKC' 
    }
  ]);

  // Pass tiers
  const [passTypes, setPassTypes] = useState<TierRow[]>([
    { tier: 'General', price: 999, tktCount: 10000 },
    { tier: 'Gold', price: 1499, tktCount: 5000 },
    { tier: 'Fanpit', price: 2000, tktCount: 2000 },
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/signin?redirect=/artist/add-event');
      } else if (!isArtist) {
        router.push('/');
      }
    }
  }, [isAuthenticated, isArtist, isLoading, router]);

  // Show Details handlers
  const addDetailRow = () => {
    // Pick the next city not yet added if available, otherwise default to Bengaluru
    const existingCities = new Set(details.map((d) => d.city));
    const nextCityObj = PRESET_CITIES.find((c) => !existingCities.has(c.city)) || PRESET_CITIES[2];

    setDetails([
      ...details,
      {
        city: nextCityObj.city,
        date: toDisplayDateFormat(getTodayISO()),
        venue: nextCityObj.venue,
      },
    ]);
  };

  const removeDetailRow = (index: number) => {
    if (details.length > 1) {
      setDetails(details.filter((_, i) => i !== index));
    }
  };

  const handleCityChange = (index: number, newCity: string) => {
    const updated = [...details];
    updated[index].city = newCity;
    // Auto-fill the suggested venue if available
    if (CITY_VENUE_MAP[newCity]) {
      updated[index].venue = CITY_VENUE_MAP[newCity];
    }
    setDetails(updated);
  };

  const handleDateChange = (index: number, isoDate: string) => {
    const updated = [...details];
    updated[index].date = toDisplayDateFormat(isoDate);
    setDetails(updated);
  };

  const handleVenueChange = (index: number, newVenue: string) => {
    const updated = [...details];
    updated[index].venue = newVenue;
    setDetails(updated);
  };

  // Tier handlers
  const addTierRow = () => {
    setPassTypes([...passTypes, { tier: 'Backstage Pass', price: 4999, tktCount: 20 }]);
  };

  const removeTierRow = (index: number) => {
    if (passTypes.length > 1) {
      setPassTypes(passTypes.filter((_, i) => i !== index));
    }
  };

  const updateTier = (index: number, field: keyof TierRow, value: any) => {
    const updated = [...passTypes];
    (updated[index] as any)[field] = field === 'tier' ? value : Number(value);
    setPassTypes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !img || !desp || !token) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    const artistsList = artistsText
      ? artistsText.split(',').map((a) => a.trim()).filter(Boolean)
      : [user?.name || 'Artist'];

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await apiAddEvent(
        {
          name,
          category,
          img,
          artists: artistsList,
          desp,
          details,
          passTypes,
        },
        token
      );

      if (res.success) {
        setSuccessMsg('🎉 Event listed and ticket inventory initialized in Redis!');
        setTimeout(() => {
          router.push('/events');
        }, 1500);
      } else {
        setErrorMsg(res.msg || 'Failed to list event.');
      }
    } catch (err: any) {
      console.error('Error adding event:', err);
      setErrorMsg(err.message || 'Error occurred while listing event.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-zinc-400">
        Verifying organizer permissions...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <Link href="/events" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events</span>
      </Link>

      {/* Header */}
      <div className="p-8 rounded-3xl glass-panel border border-white/10 relative overflow-hidden bg-gradient-to-r from-purple-950/40 via-[#07080d] to-fuchsia-950/40">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Artist & Organizer Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Create & List a New Live Show
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Publish event tour schedules, configure ticket pricing tiers, and manage live availability.
          </p>
        </div>
      </div>

      {/* Creation Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 1. Basic Info */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-4">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs">
            1. Event Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Event Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Divine: Punya Arena Tour Live"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Genre / Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-zinc-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Poster Image URL *
              </label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                value={img}
                onChange={(e) => setImg(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Performing Artists (Comma Separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Divine, MC Stan, Seedhe Maut"
                value={artistsText}
                onChange={(e) => setArtistsText(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Event Description & Lineup Details *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Provide a compelling overview of the live concert, schedule, guidelines, and age limit..."
              value={desp}
              onChange={(e) => setDesp(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* 2. Tour Schedule / Cities */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-fuchsia-400" />
              <span>2. Tour Dates & Venues</span>
            </h2>
            <button
              type="button"
              onClick={addDetailRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Another City</span>
            </button>
          </div>

          {/* Column Header Labels */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-3.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            <div className="sm:col-span-4 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>City Hub</span>
            </div>
            <div className="sm:col-span-3 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Show Date</span>
            </div>
            <div className="sm:col-span-4 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Venue (Editable)</span>
            </div>
            <div className="sm:col-span-1 text-center">
              <span>Action</span>
            </div>
          </div>

          <div className="space-y-3">
            {details.map((detail, index) => {
              const isPreset = PRESET_CITIES.some((c) => c.city === detail.city);

              return (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 items-center hover:border-fuchsia-500/30 transition-all">
                  
                  {/* City Selector */}
                  <div className="sm:col-span-4 space-y-1">
                    <label className="sm:hidden text-[10px] uppercase font-bold text-zinc-400">City</label>
                    <div className="flex flex-col gap-1.5">
                      <select
                        value={isPreset ? detail.city : 'Other'}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'Other') {
                            handleCityChange(index, '');
                          } else {
                            handleCityChange(index, val);
                          }
                        }}
                        className="w-full bg-zinc-900/90 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                      >
                        {PRESET_CITIES.map((c) => (
                          <option key={c.city} value={c.city} className="bg-zinc-900 text-white">
                            {c.city}
                          </option>
                        ))}
                        <option value="Other" className="bg-zinc-900 text-fuchsia-400">
                          + Other / Custom City
                        </option>
                      </select>

                      {!isPreset && (
                        <input
                          type="text"
                          required
                          placeholder="Type custom city name..."
                          value={detail.city}
                          onChange={(e) => handleCityChange(index, e.target.value)}
                          className="w-full bg-white/5 border border-purple-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                        />
                      )}
                    </div>
                  </div>

                  {/* Future Date Selector with Mini Calendar */}
                  <div className="sm:col-span-3 space-y-1">
                    <label className="sm:hidden text-[10px] uppercase font-bold text-zinc-400">Show Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        min={getTodayISO()}
                        value={toInputDateFormat(detail.date)}
                        onChange={(e) => handleDateChange(index, e.target.value)}
                        className="w-full bg-zinc-900/90 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-fuchsia-500 cursor-pointer [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {/* Venue (Auto-suggested & Editable) */}
                  <div className="sm:col-span-4 space-y-1">
                    <label className="sm:hidden text-[10px] uppercase font-bold text-zinc-400">Venue (Editable)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MMRDA Grounds, BKC"
                      value={detail.venue}
                      onChange={(e) => handleVenueChange(index, e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Delete Button */}
                  <div className="sm:col-span-1 flex justify-center pt-2 sm:pt-0">
                    {details.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeDetailRow(index)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition-all"
                        title="Remove this tour date"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-zinc-600 font-bold">1 min</span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Pass Tiers & Inventory */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-cyan-400" />
              <span>3. Ticket Tiers & Capacity (Auto-Cached in Redis)</span>
            </h2>
            <button
              type="button"
              onClick={addTierRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Pass Tier</span>
            </button>
          </div>

          <div className="space-y-3">
            {passTypes.map((tier, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 items-center">
                <div className="sm:col-span-5">
                  <label className="text-[10px] text-zinc-400 block mb-1">Tier Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. General Admission / VIP"
                    value={tier.tier}
                    onChange={(e) => updateTier(index, 'tier', e.target.value)}
                    className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[10px] text-zinc-400 block mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={tier.price}
                    onChange={(e) => updateTier(index, 'price', e.target.value)}
                    className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[10px] text-zinc-400 block mb-1">Total Capacity</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={tier.tktCount}
                    onChange={(e) => updateTier(index, 'tktCount', e.target.value)}
                    className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="sm:col-span-1 flex justify-center pt-3 sm:pt-0">
                  {passTypes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTierRow(index)}
                      className="p-1.5 text-zinc-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-sm gradient-btn-primary shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <PlusCircle className="w-5 h-5" />
              <span>Publish & List Event Now</span>
            </>
          )}
        </button>

      </form>

    </div>
  );
}
