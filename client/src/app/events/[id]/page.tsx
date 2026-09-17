'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { EventItem, PassType, EventDetail } from '@/types';
import { fetchEvents, apiCreateOrder, apiVerifyPayment, apiBookEvent } from '@/lib/api';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Ticket, 
  ShieldCheck, 
  Flame, 
  Check, 
  AlertCircle, 
  Minus, 
  Plus, 
  ArrowLeft,
  Lock,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();
  const { user, token, isAuthenticated, isArtist } = useAuth();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedShow, setSelectedShow] = useState<EventDetail | null>(null);
  const [selectedPass, setSelectedPass] = useState<PassType | null>(null);
  const [ticketCount, setTicketCount] = useState<number>(1);
  const [bookingInProgress, setBookingInProgress] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  
  useEffect(() => {
    async function loadEvent() {
      setLoading(true);
      try {
        const allEvents = await fetchEvents({});
        const currentEvent = allEvents.find((e) => e._id === eventId);
        console.log("Eventid-", eventId)
        console.log("allevents-", allEvents)
        if (currentEvent) {
          setEvent(currentEvent);
          if (currentEvent.details && currentEvent.details.length > 0) {
            setSelectedShow(currentEvent.details[0]);
          }
          if (currentEvent.passTypes && currentEvent.passTypes.length > 0) {
            setSelectedPass(currentEvent.passTypes[0]);
          }
        }
      } catch (err) {
        console.error('Error loading event:', err);
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  console.log("user, token, isAuthenticated", user, token, isAuthenticated)
  const handleBooking = async () => {
    if (!isAuthenticated || !token || !user) {
      router.push(`/signin?redirect=/events/${eventId}`);
      return;
    }

    if (isArtist) {
      setErrorMsg('Artists are not allowed to book tickets. Please use an Attendee account to purchase passes.');
      return;
    }

    if (!event || !selectedShow || !selectedPass) {
      setErrorMsg('Please select a show date and pass tier.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setBookingInProgress(true);

    try {
      const totalAmount = selectedPass.price * ticketCount;

      // 1. Create order on server (which locks Redis inventory)
      const orderRes = await apiCreateOrder(
        {
          amount: totalAmount,
          eventId: event._id,
          passType: selectedPass.tier,
          tkts: ticketCount,
          receipt: `rcpt_${Date.now()}`
        },
        token
      );

      console.log("Order res-", orderRes.success)
      if (!orderRes.success || !orderRes.order) {
        setErrorMsg(orderRes.msg || 'Unable to reserve tickets. They may be sold out.');
        setBookingInProgress(false);
        return;
      }

      const order = orderRes.order;

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_S8aRTZcnQ447ir',
        amount: order.amount,
        currency: order.currency,
        name: 'ShowPass Events',
        description: `Booking for ${event.name} (${selectedPass.tier})`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // 3. Verify payment signature on backend
            const verifyRes = await apiVerifyPayment(
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              token
            );

            if (verifyRes.success) {
              // 4. Save booking record and decrement persistent database inventory
              const bookRes = await apiBookEvent(
                {
                  uId: user.id,
                  eId: event._id,
                  passType: selectedPass.tier,
                  tkts: ticketCount,
                  detail: {
                    city: selectedShow.city,
                    venue: selectedShow.venue,
                    date: new Date(selectedShow.date).toISOString(),
                  },
                },
                token
              );

              if (bookRes.success) {
                setSuccessMsg('🎉 Tickets booked successfully! Redirecting to your passes...');
                setTimeout(() => {
                  router.push('/my-bookings');
                }, 1500);
              } else {
                setErrorMsg(bookRes.msg || 'Booking confirmation failed.');
              }
            } else {
              setErrorMsg('Payment verification failed.');
            }
          } catch (verifyErr: any) {
            console.error('Error during post-payment confirmation:', verifyErr);
            setErrorMsg('Payment succeeded but booking record failed. Please contact support.');
          } finally {
            setBookingInProgress(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.mail || '',
        },
        theme: {
          color: '#9333ea',
        },
      };

      if (typeof window.Razorpay !== 'undefined') {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          setErrorMsg(`Payment failed: ${resp.error.description}`);
          setBookingInProgress(false);
        });
        rzp.open();
      } else {
        setErrorMsg('Razorpay payment gateway failed to load. Please refresh the page.');
        setBookingInProgress(false);
      }

    } catch (err: any) {
      console.error('Error initiating booking:', err);
      setErrorMsg(err.message || 'An unexpected error occurred during booking.');
      setBookingInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-400">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Event Not Found</h2>
        <p className="text-zinc-400">The event you are looking for does not exist or has ended.</p>
        <Link href="/events" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full gradient-btn-primary text-sm font-bold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>
      </div>
    );
  }

  const totalPrice = selectedPass ? selectedPass.price * ticketCount : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Back Link */}
      <Link href="/events" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events</span>
      </Link>

      {/* Hero Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Poster & Highlights */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl">
            <img
              src={event.img}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-transparent to-black/20" />
            
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-zinc-200 border border-white/10">
                {event.category}
              </span>
            </div>

            {event.hype && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{event.hype}% Hype</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Booking Form & Tiers */}
        <div className="lg:col-span-7 space-y-6">
          
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {event.name}
            </h1>
            
            {event.artists && event.artists.length > 0 && (
              <div className="flex items-center gap-2 mt-2 text-sm text-zinc-300">
                <Users className="w-4 h-4 text-fuchsia-400" />
                <span className="font-semibold">Starring:</span>
                <span>{event.artists.join(', ')}</span>
              </div>
            )}
          </div>

          {/* 1. Select Tour Date / Venue */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
              1. Select Date & Venue
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {event.details.map((detail, idx) => {
                const isSelected = selectedShow === detail;
                const formattedDate = new Date(detail.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  weekday: 'short'
                });

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedShow(detail)}
                    className={`p-3.5 rounded-2xl text-left glass-panel transition-all flex flex-col justify-between gap-2 border ${
                      isSelected
                        ? 'border-fuchsia-500 bg-purple-900/20 shadow-lg shadow-purple-500/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{detail.city}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-fuchsia-400" />}
                    </div>
                    <span className="text-xs font-semibold text-white truncate">{detail.venue}</span>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                      <Calendar className="w-3 h-3 text-zinc-500" />
                      <span>{formattedDate}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Select Pass Tier */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
              2. Select Pass Tier
            </label>
            <div className="space-y-2.5">
              {event.passTypes.map((tier) => {
                const isSelected = selectedPass?.tier === tier.tier;
                return (
                  <div
                    key={tier.tier}
                    onClick={() => setSelectedPass(tier)}
                    className={`p-4 rounded-2xl glass-panel transition-all flex items-center justify-between cursor-pointer border ${
                      isSelected
                        ? 'border-purple-500 bg-purple-900/25 shadow-lg shadow-purple-500/20'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-fuchsia-500 bg-fuchsia-500' : 'border-zinc-500'}`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{tier.tier} Pass</h4>
                        <span className="text-xs text-zinc-400">
                          {tier.tktCount > 0 ? (
                            <span className="text-emerald-400 font-semibold">{tier.tktCount} passes left</span>
                          ) : (
                            <span className="text-rose-400 font-semibold">Sold Out</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <span className="text-base sm:text-lg font-black text-white">
                      ₹{tier.price}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Quantity & Summary */}
          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Ticket Quantity</span>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-1">
                <button
                  onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                  disabled={ticketCount <= 1}
                  className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 text-white"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold text-white px-2">{ticketCount}</span>
                <button
                  onClick={() => setTicketCount(Math.min(5, ticketCount + 1))}
                  disabled={ticketCount >= 5}
                  className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 text-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10">
              {isArtist ? (
                <div className="p-4 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <Sparkles className="w-4 h-4 text-fuchsia-400" />
                    <span>Artist Account View</span>
                  </div>
                  <p className="text-zinc-300">
                    You are logged in with an <strong>Artist</strong> account. Ticket booking is only enabled for Attendee accounts.
                  </p>
                  <div className="pt-2 flex items-center gap-3">
                    <Link
                      href="/artist/my-shows"
                      className="px-4 py-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs transition-colors"
                    >
                      Manage My Shows
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 block">Total Amount (incl. taxes)</span>
                    <span className="text-2xl font-black text-white">₹{totalPrice}</span>
                  </div>

                  <button
                    onClick={handleBooking}
                    disabled={bookingInProgress || !selectedPass || selectedPass.tktCount <= 0}
                    className="px-8 py-3 rounded-full font-bold text-sm gradient-btn-primary shadow-xl shadow-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {bookingInProgress ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Reserving...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Pay ₹{totalPrice} & Book</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Error / Success Notifications */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="flex items-center gap-6 text-xs text-zinc-400 pt-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Razorpay Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-cyan-400" />
              <span>Instant QR Ticket</span>
            </div>
          </div>

        </div>

      </div>

      {/* About Event Description */}
      <div className="p-8 rounded-3xl glass-panel border border-white/10 space-y-4">
        <h2 className="text-xl font-bold text-white">About the Event</h2>
        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
          {event.desp}
        </p>
      </div>

    </div>
  );
}
