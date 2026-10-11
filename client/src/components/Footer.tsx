import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Zap, QrCode, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#050608] border-t border-white/10 mt-auto pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Props Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-white/10">
          <div className="flex items-center gap-4 p-4 rounded-xl glass-panel">
            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Instant Booking</h4>
              <p className="text-xs text-zinc-400">Lock your seats with 10-min reservation hold</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl glass-panel">
            <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Smart QR Passes</h4>
              <p className="text-xs text-zinc-400">Seamless mobile contactless entry</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl glass-panel">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Buyer Guarantee</h4>
              <p className="text-xs text-zinc-400">Verified official artists & Razorpay security</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          <div className="space-y-4 col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                SHOW<span className="gradient-text-neon">PASS</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed">
              India's premier live entertainment platform for concerts, comedy specials, music festivals, and theatre tours.
            </p>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-4">Categories</h5>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><Link href="/events?category=Music" className="hover:text-white transition-colors">Music & EDM Concerts</Link></li>
              <li><Link href="/events?category=Comedy" className="hover:text-white transition-colors">Standup Comedy</Link></li>
              <li><Link href="/events?category=Nightlife" className="hover:text-white transition-colors">Club & Nightlife</Link></li>
              <li><Link href="/events?category=Theatre" className="hover:text-white transition-colors">Theatre & Plays</Link></li>
              <li><Link href="/events?category=Workshops" className="hover:text-white transition-colors">Workshops & Masterclasses</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-4">For Organizers</h5>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><Link href="/register" className="hover:text-white transition-colors">List Your Event</Link></li>
              <li><Link href="/artist/add-event" className="hover:text-white transition-colors">Artist Portal</Link></li>
              <li><Link href="/signin" className="hover:text-white transition-colors">Organizer Login</Link></li>
              <li><span className="text-zinc-500 cursor-not-allowed">Pricing & Payouts</span></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-4">Support & Trust</h5>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><span className="hover:text-white transition-colors cursor-pointer">Help Center & FAQ</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Terms & Conditions</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Refund & Cancellation</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} ShowPass Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for live music & entertainment enthusiasts</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
