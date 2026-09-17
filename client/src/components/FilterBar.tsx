'use client';

import React from 'react';
import { useAuth } from '@/lib/authContext';
import { MapPin, Calendar, X, Sparkles, Search, User } from 'lucide-react';

interface FilterBarProps {
  category: string;
  setCategory: (cat: string) => void;
  city: string;
  setCity: (city: string) => void;
  date: string;
  setDate: (date: string) => void;
  onFilterChange?: () => void;
}

const CATEGORIES = [
  'All',
  'Music',
  'Comedy',
  'Concert',
  'Nightlife',
  'Theatre',
  'Sports',
  'Workshops'
];

const CITIES = [
  'All',
  'Mumbai',
  'Delhi NCR',
  'Bengaluru',
  'Goa',
  'Hyderabad',
  'Pune',
  'Kolkata'
];

export const FilterBar: React.FC<FilterBarProps> = ({
  category,
  setCategory,
  city,
  setCity,
  date,
  setDate,
  onFilterChange
}) => {
  const { searchQuery, clearSearch } = useAuth();

  return (
    <div className="w-full space-y-4 mb-8">
      
      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = category === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                onFilterChange?.();
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'gradient-btn-primary shadow-lg shadow-purple-600/30 scale-105'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10'
              }`}
            >
              {cat === 'All' && <Sparkles className="w-3.5 h-3.5" />}
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Main Filter Bar Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-2 rounded-2xl glass-panel border border-white/10 items-center">
        
        {/* Active Search Tag or Search Status */}
        <div className="sm:col-span-6 flex items-center px-3 py-1">
          {searchQuery ? (
            <div className="flex items-center justify-between w-full bg-purple-500/15 border border-purple-500/30 rounded-xl px-3.5 py-2 text-xs text-purple-200">
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Searching: <strong className="text-white font-semibold">&ldquo;{searchQuery}&rdquo;</strong></span>
              </div>
              <button
                onClick={() => {
                  clearSearch();
                  onFilterChange?.();
                }}
                className="ml-2 p-1 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Sparkles className="w-4 h-4 text-fuchsia-400" />
              <span>Use the <strong>Navbar Search</strong> to find shows, concerts & artists across India</span>
            </div>
          )}
        </div>

        {/* City Filter */}
        <div className="sm:col-span-3 relative flex items-center">
          <MapPin className="w-4 h-4 text-cyan-400 absolute left-3.5 pointer-events-none" />
          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              onFilterChange?.();
            }}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
          >
            {CITIES.map((c) => (
              <option key={c} value={c} className="bg-zinc-900 text-white">
                {c === 'All' ? 'All Locations' : c}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="sm:col-span-3 relative flex items-center">
          <Calendar className="w-4 h-4 text-fuchsia-400 absolute left-3.5 pointer-events-none" />
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              onFilterChange?.();
            }}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-fuchsia-500 cursor-pointer"
          />
          {date && (
            <button
              onClick={() => {
                setDate('');
                onFilterChange?.();
              }}
              title="Clear date"
              className="absolute right-3 p-1 rounded-full text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
};

