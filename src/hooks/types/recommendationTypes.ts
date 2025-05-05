import { CategoryType } from '@/components/CategoryFilter';

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  attendees: number;
  pricePerPerson?: number;
  phoneNumber?: string;
  whatsappNumber?: string;
  images?: string[];
  approval_status?: string;
  user_id?: string;
  isHiddenGem?: boolean;
  isMustVisit?: boolean;
}

export interface Recommendation {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  rating: number;
  image: string;
  images?: string[];
  openNow?: boolean;
  hours?: string;
  priceLevel?: string;
  phone?: string;
  distance?: string;
  calculatedDistance?: number;
  tags?: string[];
  tagMatches?: string[];  // Added for tag matching
  isTagMatch?: boolean;   // Added to indicate if this is a tag match
  price_range_min?: number;
  price_range_max?: number;
  price_unit?: string;
  availability?: string;
  availability_days?: string[];
  availability_start_time?: string;
  availability_end_time?: string;
  instagram?: string;
  map_link?: string;
  created_at?: string;
  isHiddenGem?: boolean;
  isMustVisit?: boolean;
  search_rank?: number;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UseRecommendationsProps {
  initialQuery?: string;
  initialCategory?: string;
  loadDefaultResults?: boolean;
}

export interface FilterOptions {
  maxDistance: number;
  minRating: number;
  priceLevel: number;
  openNow: boolean;
  hiddenGem?: boolean;
  mustVisit?: boolean;
  distanceUnit?: 'km' | 'mi';
}

export interface SupabaseEvent {
  approval_status: string;
  attendees: number | null;
  created_at: string;
  date: string;
  description: string;
  id: string;
  image: string;
  location: string;
  time: string;
  title: string;
  price_per_person?: number;
}
