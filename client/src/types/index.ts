export interface PassType {
  tier: string;
  price: number;
  tktCount: number;
}

export interface EventDetail {
  city: string;
  date: string | Date;
  venue: string;
}

export interface EventItem {
  _id: string;
  name: string;
  category: string;
  details: EventDetail[];
  passTypes: PassType[];
  img: string;
  artists: string[];
  desp: string;
  hype?: number;
  creatorId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BannerItem {
  _id: string;
  title: string;
  url: string;
}

export interface ArtistItem {
  _id: string;
  name: string;
  headline?: string;
  stats?: number;
  img?: string;
  profilePic?: string;
  events?: EventItem[];
  createdAt?: string;
}

export interface UserItem {
  id: string;
  name: string;
  mail?: string;
  role: 'user' | 'artist';
  interest?: string[];
  img?: string;
  profilePic?: string;
}

export interface BookingItem {
  _id: string;
  userId: string;
  eventId: EventItem | string;
  passType: string;
  date: string;
  location: string;
  tktCount: number;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  msg?: string;
  message?: string;
  data?: T;
  token?: string;
  user?: UserItem;
  order?: any;
}
