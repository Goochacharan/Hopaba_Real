
export interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  description?: string;
  address: string;
  city: string;
  area: string;
  coordinates?: any; // Point type from PostgreSQL
  rating?: number;
  review_count?: number;
  price_range_min?: number;
  price_range_max?: number;
  price_unit?: string;
  open_now?: boolean;
  business_hours?: any; // JSONB type from PostgreSQL
  experience?: string;
  languages?: string[];
  availability?: string;
  image_url?: string;
  images?: string[];
  tags?: string[];
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
}
