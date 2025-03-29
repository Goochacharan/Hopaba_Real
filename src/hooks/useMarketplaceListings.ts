
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string; // 'new', 'like new', 'good', 'fair', 'poor'
  category: string;
  images: string[];
  seller_name: string;
  seller_id?: string;
  seller_rating: number;
  seller_phone?: string;
  seller_whatsapp?: string;
  seller_instagram?: string;
  location: string;
  created_at: string;
  updated_at: string;
  approval_status?: string; // Added this property
  isHiddenGem?: boolean; // Added this property
  isMustVisit?: boolean; // Added this property
}

interface UseMarketplaceListingsProps {
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  searchQuery?: string;
}

const mockListings: MarketplaceListing[] = [
  // ... mock listing data
];

// Added for parsing price from queries
const extractPriceFromQuery = (query: string): number | null => {
  const priceMatch = query.match(/(\d+)/);
  return priceMatch ? parseInt(priceMatch[0], 10) : null;
};

// Added for checking if query contains badge terms
const queryContainsBadge = (query: string, badgeType: 'hidden gem' | 'must visit'): boolean => {
  const lowerQuery = query.toLowerCase();
  
  if (badgeType === 'hidden gem') {
    return lowerQuery.includes('hidden gem') || 
           lowerQuery.includes('underrated') || 
           lowerQuery.includes('secret') ||
           lowerQuery.includes('undiscovered');
  } else if (badgeType === 'must visit') {
    return lowerQuery.includes('must visit') || 
           lowerQuery.includes('must see') || 
           lowerQuery.includes('must try') ||
           lowerQuery.includes('top place');
  }
  
  return false;
};

export const useMarketplaceListings = ({
  category,
  condition,
  minPrice,
  maxPrice,
  minRating,
  searchQuery = ''
}: UseMarketplaceListingsProps = {}) => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchListings = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('marketplace_listings')
        .select('*')
        .eq('approval_status', 'approved');

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (condition) {
        query = query.eq('condition', condition);
      }

      if (minPrice) {
        query = query.gte('price', minPrice);
      }

      if (maxPrice) {
        query = query.lte('price', maxPrice);
      }

      if (minRating) {
        query = query.gte('seller_rating', minRating);
      }

      // Basic text search
      if (searchQuery && searchQuery.trim() !== '') {
        // Extract potential price from the query
        const queryPrice = extractPriceFromQuery(searchQuery);
        
        // Check if query contains badge terms that can be applied to marketplace
        const hasHiddenGem = queryContainsBadge(searchQuery, 'hidden gem');
        const hasMustVisit = queryContainsBadge(searchQuery, 'must visit');
        
        // Basic text matching for title and description
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        
        // Apply price filtering if found in the query
        if (queryPrice) {
          // We'll adjust this in the post-processing below
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching marketplace listings:', error);
          setError('Failed to fetch marketplace listings');
          setListings([]);
        } else if (data) {
          let filteredData = [...data];
          
          // Post-process the results to apply price filtering with some flexibility (±20%)
          if (queryPrice) {
            const minAcceptablePrice = queryPrice * 0.8;
            const maxAcceptablePrice = queryPrice * 1.2;
            filteredData = filteredData.filter(item => 
              item.price >= minAcceptablePrice && item.price <= maxAcceptablePrice
            );
          }
          
          // Apply hidden gem and must visit filtering
          // For marketplace, we'll tag certain items as hidden gems or must visit
          if (hasHiddenGem || hasMustVisit) {
            // Assign these properties dynamically for display
            filteredData = filteredData.map((item, index) => ({
              ...item,
              isHiddenGem: index % 3 === 0, // Simulate hidden gems
              isMustVisit: index % 5 === 0  // Simulate must visit
            }));
            
            // Filter based on the criteria
            if (hasHiddenGem) {
              filteredData = filteredData.filter(item => item.isHiddenGem);
            }
            
            if (hasMustVisit) {
              filteredData = filteredData.filter(item => item.isMustVisit);
            }
          }
          
          setListings(filteredData);
        }
      } else {
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching marketplace listings:', error);
          setError('Failed to fetch marketplace listings');
          setListings([]);
        } else if (data) {
          // Add virtual properties for marketplace items
          const enhancedData = data.map((item, index) => ({
            ...item,
            isHiddenGem: index % 3 === 0, // Simulate hidden gems
            isMustVisit: index % 5 === 0  // Simulate must visit
          }));
          setListings(enhancedData);
        }
      }
    } catch (err) {
      console.error('Error in fetchListings:', err);
      setError('An unexpected error occurred');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to manually search marketplace listings
  const search = (query: string) => {
    if (!query.trim()) {
      fetchListings();
      return;
    }
    
    setLoading(true);
    
    // Call the fetchListings function with the updated searchQuery
    const searchWithQuery = async () => {
      try {
        let supabaseQuery = supabase
          .from('marketplace_listings')
          .select('*')
          .eq('approval_status', 'approved')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`);
          
        const { data, error } = await supabaseQuery;
        
        if (error) {
          console.error('Error searching marketplace:', error);
          setError('Failed to search marketplace');
          setListings([]);
        } else if (data) {
          // Extract potential price from the query
          const queryPrice = extractPriceFromQuery(query);
          
          // Check for badge terms
          const hasHiddenGem = queryContainsBadge(query, 'hidden gem');
          const hasMustVisit = queryContainsBadge(query, 'must visit');
          
          // Add properties and filter results
          let filteredData = data.map((item, index) => ({
            ...item,
            isHiddenGem: index % 3 === 0, // Simulate hidden gems
            isMustVisit: index % 5 === 0  // Simulate must visit
          }));
          
          // Apply price filtering if found in the query
          if (queryPrice) {
            const minAcceptablePrice = queryPrice * 0.8;
            const maxAcceptablePrice = queryPrice * 1.2;
            filteredData = filteredData.filter(item => 
              item.price >= minAcceptablePrice && item.price <= maxAcceptablePrice
            );
          }
          
          // Apply badge filtering
          if (hasHiddenGem) {
            filteredData = filteredData.filter(item => item.isHiddenGem);
          }
          
          if (hasMustVisit) {
            filteredData = filteredData.filter(item => item.isMustVisit);
          }
          
          setListings(filteredData);
        }
      } catch (err) {
        console.error('Error in marketplace search:', err);
        setError('An unexpected error occurred while searching');
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    
    searchWithQuery();
  };

  useEffect(() => {
    fetchListings();
  }, [category, condition, minPrice, maxPrice, minRating]);

  // Also trigger a search when the searchQuery prop changes
  useEffect(() => {
    if (searchQuery) {
      search(searchQuery);
    }
  }, [searchQuery]);

  return {
    listings,
    loading,
    error,
    refresh: fetchListings,
    search
  };
};

// Add the useMarketplaceListing hook for individual listing details
export const useMarketplaceListing = (listingId: string) => {
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) {
        setError("Listing ID is required");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('marketplace_listings')
          .select('*')
          .eq('id', listingId)
          .eq('approval_status', 'approved')
          .single();

        if (error) {
          console.error('Error fetching marketplace listing:', error);
          setError('Failed to fetch marketplace listing');
          setListing(null);
        } else if (data) {
          // Add virtual properties
          const enhancedListing = {
            ...data,
            isHiddenGem: false,
            isMustVisit: false
          };
          setListing(enhancedListing);
        }
      } catch (err) {
        console.error('Error in fetchListing:', err);
        setError('An unexpected error occurred');
        setListing(null);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  return {
    listing,
    loading,
    error
  };
};
