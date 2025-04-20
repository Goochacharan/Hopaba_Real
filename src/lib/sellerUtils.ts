
import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if a seller has reached their listing limit
 * @param sellerId The ID of the seller
 * @returns Object containing limit information and whether the limit is reached
 */
export const checkSellerListingLimit = async (sellerId: string) => {
  try {
    // First check if the seller exists in the sellers table
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .select('listing_limit')
      .eq('seller_id', sellerId)
      .single();
    
    if (sellerError && sellerError.code !== 'PGRST116') {
      console.error('Error checking seller:', sellerError);
      throw sellerError;
    }

    // Count current listings
    const { count, error: countError } = await supabase
      .from('marketplace_listings')
      .select('*', { count: 'exact' })
      .eq('seller_id', sellerId);

    if (countError) {
      console.error('Error counting listings:', countError);
      throw countError;
    }

    // If seller doesn't exist, create with default limit of 5
    if (!seller) {
      return {
        currentCount: count || 0,
        limit: 5,
        limitReached: (count || 0) >= 5
      };
    }

    return {
      currentCount: count || 0,
      limit: seller.listing_limit || 5,
      limitReached: (count || 0) >= (seller.listing_limit || 5)
    };
  } catch (err) {
    console.error('Error checking seller listing limit:', err);
    throw err;
  }
};

/**
 * Creates or updates a seller in the database
 * @param sellerData Seller information to save
 * @returns The created or updated seller data
 */
export const saveSellerInfo = async (sellerData: {
  sellerId: string;
  sellerName: string;
  sellerPhone?: string;
  sellerWhatsapp?: string;
  sellerInstagram?: string;
}) => {
  try {
    const { sellerId, sellerName, sellerPhone, sellerWhatsapp, sellerInstagram } = sellerData;
    
    // Check if seller already exists
    const { data: existingSeller } = await supabase
      .from('sellers')
      .select('*')
      .eq('seller_id', sellerId)
      .single();
    
    if (existingSeller) {
      // Update existing seller
      const { data, error } = await supabase
        .from('sellers')
        .update({
          seller_name: sellerName,
          seller_phone: sellerPhone,
          seller_whatsapp: sellerWhatsapp,
          seller_instagram: sellerInstagram,
          updated_at: new Date().toISOString()
        })
        .eq('seller_id', sellerId)
        .select();
      
      if (error) throw error;
      return data;
    } else {
      // Create new seller with default limit
      const { data, error } = await supabase
        .from('sellers')
        .insert({
          seller_id: sellerId,
          seller_name: sellerName,
          seller_phone: sellerPhone,
          seller_whatsapp: sellerWhatsapp,
          seller_instagram: sellerInstagram,
          listing_limit: 5 // Default limit
        })
        .select();
      
      if (error) throw error;
      return data;
    }
  } catch (err) {
    console.error('Error saving seller info:', err);
    throw err;
  }
};
