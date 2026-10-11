'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BannerItem } from '@/types';
import { ChevronLeft, ChevronRight, Calendar, Sparkles, ArrowRight } from 'lucide-react';

interface HeroCarouselProps {
  banners: BannerItem[];
}

const DEFAULT_BANNERS: BannerItem[] = [
  {
    _id: 'b1',
    title: 'Yo Yo Honey Singh: My Story Live Arena Tour',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1600&auto=format&fit=crop',
  },
  {
    _id: 'b2',
    title: 'Sunburn Arena ft. Alan Walker Live 2026',
    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1600&auto=format&fit=crop',
  },
  {
    _id: 'b3',
    title: 'Zakir Khan Live - Tathastu Extended World Tour',
    url: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=1600&auto=format&fit=crop',
  }
];

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ banners }) => {
  const displayBanners = banners && banners.length > 0 ? banners : DEFAULT_BANNERS;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [displayBanners.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + displayBanners.length) % displayBanners.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % displayBanners.length);
  };

  const current = displayBanners[currentIndex];

  return (
    <div className="relative w-full h-[400px] sm:h-[500px] md:h-[560px] rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl group">
      
      {/* Background Image with Cinematic Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
        style={{ backgroundImage: `url(${current.url})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-[#07080d]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07080d]/90 via-[#07080d]/40 to-transparent" />
      </div>

      {/* Floating Content Card */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 md:p-14 max-w-3xl z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md self-start">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Featured Headline Tour</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4 drop-shadow-md">
          {current.title}
        </h1>

        <p className="text-xs sm:text-sm text-zinc-300 mb-6 max-w-xl line-clamp-2">
          Experience electrifying live performances, stadium visuals, and high-energy music. Premium tier tickets selling out fast.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/events"
            className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold gradient-btn-primary shadow-xl shadow-purple-600/30"
          >
            <span>Book Tickets Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/events"
            className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold glass-panel text-white hover:bg-white/10 transition-colors"
          >
            <span>View Tour Dates</span>
          </Link>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full glass-panel text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 z-20"
        aria-label="Previous Banner"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full glass-panel text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 z-20"
        aria-label="Next Banner"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 right-6 sm:right-10 flex items-center gap-2 z-20">
        {displayBanners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${index === currentIndex ? 'w-8 bg-fuchsia-500 shadow-lg shadow-fuchsia-500/50' : 'w-2 bg-white/30 hover:bg-white/60'}`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>

    </div>
  );
};
