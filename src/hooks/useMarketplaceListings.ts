import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  model_year?: string;
  location: string;
  map_link?: string;
  seller_name: string;
  seller_id?: string;
  seller_phone?: string;
  seller_whatsapp?: string;
  seller_instagram?: string;
  seller_role: 'owner' | 'dealer';
  images?: string[];
  created_at: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  is_negotiable?: boolean;
  damage_images?: string[];
  inspection_certificates?: string[];
  shop_images?: string[]; // Added the shop_images property
  area: string;
  city: string;
  postal_code: string;
}

export const useMarketplaceListings = () => {
  return useQuery<MarketplaceListing[]>('marketplaceListings', async () => {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('*');

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  });
};
