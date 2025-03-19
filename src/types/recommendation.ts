
import { CategoryType } from '@/components/CategoryFilter';

export interface Recommendation {
  id: string;
  name: string;
  category: string;
  tags: string[];
  rating: number;
  address: string;
  distance: string;
  image: string;
  images: string[];
  description: string;
  phone: string;
  openNow: boolean;
  hours: string;
  priceLevel: string;
  reviewCount?: number;
}

export interface AppEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  attendees: number;
}

export interface UseRecommendationsProps {
  initialQuery?: string;
  initialCategory?: CategoryType;
}

export interface FilterOptions {
  maxDistance: number;
  minRating: number;
  priceLevel: number;
  openNowOnly: boolean;
  distanceUnit?: 'km' | 'mi';
}
