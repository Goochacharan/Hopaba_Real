
import { supabase } from '@/integrations/supabase/client';
import { checkSellerListingLimit, saveSellerInfo } from '@/lib/sellerUtils';
import { useToast } from '@/hooks/use-toast';

/**
 * Helper function to validate and save a marketplace listing
 * @param listing The listing data to save
 * @param userId The current user ID
 * @returns Success status and listing ID if successful
 */
export const saveMarketplaceListing = async (listing: any, userId: string) => {
  try {
    // First check if user has reached their listing limit
    const limitInfo = await checkSellerListingLimit(userId);
    
    // If this is an edit, we need the original listing to see if it's the same seller
    let isEdit = false;
    if (listing.id) {
      isEdit = true;
      const { data: existingListing } = await supabase
        .from('marketplace_listings')
        .select('seller_id')
        .eq('id', listing.id)
        .single();
        
      // If it's the same seller editing their listing, it doesn't count toward the limit
      if (existingListing && existingListing.seller_id === userId) {
        // No limit check needed for edits
      } else if (limitInfo.limitReached) {
        return {
          success: false,
          error: `You have reached your listing limit of ${limitInfo.limit} listings.`,
          listingId: null
        };
      }
    } else if (limitInfo.limitReached) {
      return {
        success: false,
        error: `You have reached your listing limit of ${limitInfo.limit} listings.`,
        listingId: null
      };
    }

    // Save or update seller info
    await saveSellerInfo({
      sellerId: userId,
      sellerName: listing.seller_name,
      sellerPhone: listing.seller_phone,
      sellerWhatsapp: listing.seller_whatsapp,
      sellerInstagram: listing.seller_instagram
    });

    // Now save the listing
    if (isEdit) {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .update({
          ...listing,
          updated_at: new Date().toISOString()
        })
        .eq('id', listing.id)
        .select()
        .single();

      if (error) throw error;
      
      return {
        success: true,
        listingId: data.id,
        error: null
      };
    } else {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .insert({
          ...listing,
          seller_id: userId,
          approval_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      
      return {
        success: true,
        listingId: data.id,
        error: null
      };
    }
  } catch (err: any) {
    console.error('Error saving marketplace listing:', err);
    return {
      success: false,
      error: err.message || 'Failed to save listing',
      listingId: null
    };
  }
};
