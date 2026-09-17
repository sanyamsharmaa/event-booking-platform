import { ApiResponse, BannerItem, BookingItem, EventItem, UserItem, ArtistItem } from '@/types';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
    console.log("response-", res)
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err);
    return {
      success: false,
      msg: err.message || 'Network error occurred. Please check backend server.',
    };
  }
}

// =======================
// Discovery & Events API
// =======================

export async function fetchEvents(filters: {
  location?: string;
  category?: string;
  date?: string;
  search?: string;
}): Promise<EventItem[]> {
  const res = await fetcher<EventItem[]>('/get-events', {
    method: 'POST',
    body: JSON.stringify({
      location: filters.location || 'All',
      category: filters.category || 'All',
      date: filters.date || '',
      search: filters.search || '',
    }),
  });

  return res.data || [];
}

export async function fetchBanners(): Promise<BannerItem[]> {
  const res = await fetcher<BannerItem[]>('/banners', {
    method: 'GET',
  });
  return res.data || [];
}

export async function fetchTrendingShows(): Promise<EventItem[]> {
  const res = await fetcher<EventItem[]>('/trending-shows', {
    method: 'POST',
  });
  return res.data || [];
}

export async function fetchRecommendedShows(token: string): Promise<EventItem[]> {
  const res = await fetcher<EventItem[]>('/recommended-shows', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data || [];
}

export async function fetchSearchArtists(artistName: string): Promise<ArtistItem[]> {
  if (!artistName || !artistName.trim()) return [];
  const res = await fetcher<ArtistItem[]>('/search-artists', {
    method: 'POST',
    body: JSON.stringify({ artistName: artistName.trim() }),
  });
  return res.data || [];
}

export async function fetchArtistProfile(artistId: string): Promise<ApiResponse<ArtistItem>> {
  const res = await fetcher<ArtistItem>('/get-artist-profile', {
    method: 'POST',
    body: JSON.stringify({ artistId }),
  });
  return res;
}

// =======================
// Auth API
// =======================

export async function apiSignIn(cred: string, pass: string, role: 'user' | 'artist'): Promise<ApiResponse> {
  return await fetcher('/signin', {
    method: 'POST',
    body: JSON.stringify({ cred, pass, role }),
  });
}

export async function apiRegister(payload: {
  name: string;
  mobile: string;
  mail: string;
  pass: string;
  role: 'user' | 'artist';
  interestArr?: string[];
  headline?: string;
  img?: string;
  profilePic?: string;
}): Promise<ApiResponse> {
  return await fetcher('/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// =======================
// Booking & Payments API
// =======================

export async function apiCreateOrder(
  data: {
    amount: number;
    eventId: string;
    tkts: number;
    passType: string;
    receipt?: string;
  },
  token: string
): Promise<ApiResponse> {
  return await fetcher('/create-order', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function apiVerifyPayment(
  data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  },
  token: string
): Promise<ApiResponse> {
  return await fetcher('/verify-payment', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function apiBookEvent(
  data: {
    uId: string;
    eId: string;
    passType: string;
    tkts: number;
    detail: {
      city: string;
      venue: string;
      date: string;
    };
  },
  token: string
): Promise<ApiResponse> {
  return await fetcher('/book-event', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function fetchMyBookings(token: string, uid: string): Promise<BookingItem[]> {
  const res = await fetcher<BookingItem[]>('/my-events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ uid }),
  });
  return res.data || [];
}

// =======================
// Artist Management API
// =======================

export async function apiAddEvent(
  eventData: {
    name: string;
    category: string;
    details: { city: string; date: string; venue: string }[];
    passTypes: { tier: string; price: number; tktCount: number }[];
    img: string;
    artists: string[];
    desp: string;
  },
  token: string
): Promise<ApiResponse> {
  return await fetcher('/add-event', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(eventData),
  });
}

export async function fetchArtistShows(token: string): Promise<EventItem[]> {
  const res = await fetcher<EventItem[]>('/artist/my-shows', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data || [];
}

export async function apiUpdateEvent(
  eventData: {
    eventId: string;
    name?: string;
    category?: string;
    details?: { city: string; date: string | Date; venue: string }[];
    passTypes?: { tier: string; price: number; tktCount: number }[];
    img?: string;
    artists?: string[];
    desp?: string;
    hype?: number;
  },
  token: string
): Promise<ApiResponse> {
  return await fetcher('/artist/update-event', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(eventData),
  });
}

export async function apiDeleteEvent(eventId: string, token: string): Promise<ApiResponse> {
  return await fetcher('/artist/delete-event', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ eventId }),
  });
}

