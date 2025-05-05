
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

export interface UseRecommendationsProps {
  initialQuery?: string;
  initialCategory?: CategoryType;
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

// Updated interface for service provider from Supabase
export interface SupabaseServiceProvider {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  area: string;
  city: string;
  contact_phone: string;
  contact_email: string;
  website: string;
  instagram: string;
  map_link: string;
  price_range_min: number | null;
  price_range_max: number | null;
  price_unit: string;
  availability: string | null;
  availability_days: string[];
  availability_start_time: string;
  availability_end_time: string;
  tags: string[];
  images: string[];
  hours: string;
  languages: string[];
  experience: string;
  created_at: string;
  approval_status: string;
  search_rank: number;
}

// Add this interface to match the Recommendation type from lib/mockData
export interface Recommendation {
  id: string;
  name: string;
  category: string;
  tags: string[];
  rating: number;
  address: string;
  distance?: string;
  image: string;
  images?: string[];
  description?: string;
  phone?: string;
  openNow?: boolean;
  hours?: string;
  availability?: string;
  priceLevel?: string;
  price_range_min?: number;
  price_range_max?: number;
  price_unit?: string;
  map_link?: string;
  instagram?: string;
  availability_days?: string[];
  availability_start_time?: string;
  availability_end_time?: string;
  calculatedDistance?: number;
  created_at?: string;
  isHiddenGem?: boolean;
  isMustVisit?: boolean;
  reviewCount?: number;
  search_rank?: number;
  area?: string;
  city?: string;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  approval_status?: string;
}
