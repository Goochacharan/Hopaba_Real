
import { CategoryType } from '@/components/CategoryFilter';

export interface Recommendation {
  id: string;
  name: string;
  category: string;
  tags: string[];
  rating: number;
  address: string;
  distance?: string; // Made optional to match mockData implementation
  image: string;
  images?: string[]; // Made optional for consistency
  description: string;
  phone?: string; // Made optional for consistency
  openNow?: boolean; // Made optional for consistency
  hours?: string; // Made optional for consistency
  priceLevel?: string; // Made optional for consistency
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
