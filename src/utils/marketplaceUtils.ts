
import { supabase } from '@/integrations/supabase/client';
import { MarketplaceListing } from '@/types/marketplace';

// Format a database listing object into our standard format
export const formatListingData = (item: any, reviewCount: number = 0): MarketplaceListing => {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    price: item.price,
    category: item.category,
    condition: item.condition,
    location: item.location,
    seller_name: item.seller_name,
    seller_id: item.seller_id,
    seller_phone: item.seller_phone,
    seller_whatsapp: item.seller_whatsapp,
    seller_instagram: item.seller_instagram,
    seller_rating: item.seller_rating,
    map_link: item.map_link,
    created_at: item.created_at,
    updated_at: item.updated_at,
    review_count: reviewCount,
    images: item.images || [],
    damage_images: item.damage_images || [],
    is_negotiable: item.is_negotiable || false,
    approval_status: item.approval_status as 'pending' | 'approved' | 'rejected'
  };
};

// Get review count for a seller
export const getSellerReviewCount = async (sellerId?: string): Promise<number> => {
  if (!sellerId) return 0;
  
  try {
    const { data, error } = await supabase
      .from('seller_reviews')
      .select('count')
      .eq('seller_id', sellerId);
      
    if (error || !data || !data.length) {
      return 0;
    }
    
    // Safely handle the count value
    const countValue = data[0]?.count;
    return typeof countValue === 'number' ? countValue : 0;
  } catch (err) {
    console.error('Error getting seller review count:', err);
    return 0;
  }
};

// Get review counts for multiple sellers
export const getSellerReviewCounts = async (sellerIds: string[]): Promise<Record<string, number>> => {
  if (!sellerIds.length) return {};
  
  const uniqueSellerIds = [...new Set(sellerIds)];
  const reviewCounts: Record<string, number> = {};
  
  for (const sellerId of uniqueSellerIds) {
    if (sellerId) {
      reviewCounts[sellerId] = await getSellerReviewCount(sellerId);
    }
  }
  
  return reviewCounts;
};
