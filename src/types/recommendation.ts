
export interface Recommendation {
  id: string;
  name: string;
  category: string;
  tags?: string[];
  rating?: number;
  address: string;
  distance?: string;
  image_url?: string;
  images?: string[];
  description?: string;
  contact_phone?: string;
  whatsapp?: string;
  openNow?: boolean;
  hours?: string;
  area?: string;
  city?: string;
  availability?: string[];
  availability_days?: string[] | string;
  availability_start_time?: string;
  availability_end_time?: string;
  created_at?: string;
}
