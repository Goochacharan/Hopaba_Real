
export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  seller_name: string;
  seller_rating: number;
  seller_phone: string | null;
  seller_whatsapp: string | null;
  seller_instagram: string | null;
  seller_id: string; 
  location: string;
  map_link: string | null;
  created_at: string;
  updated_at: string;
  approval_status?: string;
  review_count?: number;
  tags?: string[];
}

export interface MarketplaceListingsOptions {
  category?: string;
  searchQuery?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  includeAllStatuses?: boolean;
}
