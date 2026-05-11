export enum RoomType {
  ROOM = 'room',
  COTTAGE = 'cottage'
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled'
}

export interface Room {
  id: string;
  title: string;
  type: RoomType;
  pricePerNight: number;
  description: string;
  images: string[];
  amenities: string[];
  availabilityStatus: 'available' | 'unavailable';
}

export interface Booking {
  id?: string;
  guestName: string;
  phone: string;
  email: string;
  checkIn: string; // ISO string
  checkOut: string; // ISO string
  guestsCount: number;
  roomId: string;
  status: BookingStatus;
  totalPrice: number;
  createdAt: string;
}

export interface Review {
  id?: string;
  userId: string;
  userName: string;
  userPhoto: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface TouristSpot {
  id?: string;
  name: string;
  description: string;
  image: string;
  searchKeyword: string;
}

export interface SiteSettings {
  phone: string;
  bio: string;
  mapLink: string;
  images: string[];
  guestLimit: number;
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}
