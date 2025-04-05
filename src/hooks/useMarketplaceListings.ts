
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
}

interface UseMarketplaceListingsOptions {
  category?: string;
  searchQuery?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  includeAllStatuses?: boolean;
}

export const useMarketplaceListings = (options: UseMarketplaceListingsOptions = {}) => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { category, searchQuery, condition, minPrice, maxPrice, minRating, includeAllStatuses } = options;

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("Fetching marketplace listings with options:", options);

    try {
      let query = supabase
        .from('marketplace_listings')
        .select('*');
      
      // Apply approval status filter
      if (!includeAllStatuses) {
        if (user) {
          // For logged-in users, show approved listings + their own listings (any status)
          query = query.or(`approval_status.eq.approved,seller_id.eq.${user.id}`);
          console.log(`Filtering for approved listings OR seller_id=${user.id}`);
        } else {
          // For visitors, only show approved listings
          query = query.eq('approval_status', 'approved');
          console.log(`Filtering for only approved listings (user not logged in)`);
        }
      } else {
        console.log("Including all approval statuses");
      }
      
      if (category && category !== 'all') {
        // Make category filter case-insensitive
        query = query.ilike('category', `%${category}%`);
        console.log(`Filtering by category (case-insensitive): "${category}"`);
      }
      
      if (condition && condition !== 'all') {
        query = query.ilike('condition', condition);
      }
      
      if (minPrice !== undefined) {
        query = query.gte('price', minPrice);
      }
      
      if (maxPrice !== undefined) {
        query = query.lte('price', maxPrice);
      }
      
      if (minRating !== undefined && minRating > 0) {
        query = query.gte('seller_rating', minRating);
        console.log(`Filtering by minimum rating: ${minRating}`);
      }
      
      if (searchQuery && searchQuery.trim() !== '') {
        // Process natural language search query
        const processedSearchQuery = processNaturalLanguageQuery(searchQuery.trim().toLowerCase());
        
        console.log(`Processed search query: "${processedSearchQuery}"`);
        
        // Split the search query into individual words for more flexible matching
        const searchWords = processedSearchQuery.split(/\s+/).filter(word => word.length > 0);
        
        if (searchWords.length > 0) {
          // Create a complex OR condition for each word across multiple fields
          const orConditions = searchWords.map(word => {
            return `title.ilike.%${word}%,description.ilike.%${word}%,category.ilike.%${word}%,location.ilike.%${word}%`;
          }).join(',');
          
          query = query.or(orConditions);
          console.log(`Advanced search with multiple words: [${searchWords.join(', ')}]`);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log(`Found ${data?.length || 0} marketplace listings`);
      
      // If there are search words, do additional client-side filtering to improve word combination matching
      let filteredData = data || [];
      
      if (searchQuery && searchQuery.trim() !== '') {
        const processedSearchQuery = processNaturalLanguageQuery(searchQuery.trim().toLowerCase());
        const searchWords = processedSearchQuery.split(/\s+/).filter(word => word.length > 0);
        
        if (searchWords.length > 1) {
          // Calculate a relevance score for each listing based on how many search words it contains
          filteredData = filteredData.map(listing => {
            const listingText = `${listing.title} ${listing.description} ${listing.category} ${listing.location}`.toLowerCase();
            
            // Count how many of the search words appear in the listing
            const matchedWords = searchWords.filter(word => listingText.includes(word));
            const totalWords = searchWords.length;
            
            // Calculate relevance score with different weights for different fields
            let relevanceScore = matchedWords.length / totalWords;
            
            // Increase score for title matches (most important)
            const titleMatches = searchWords.filter(word => 
              listing.title.toLowerCase().includes(word)
            ).length;
            
            // Increase score for location matches (for location-based queries)
            const locationMatches = searchWords.filter(word => 
              listing.location.toLowerCase().includes(word)
            ).length;
            
            // Add bonuses for matches in different fields
            relevanceScore += (titleMatches / totalWords) * 0.5; // 50% bonus for title matches
            relevanceScore += (locationMatches / totalWords) * 0.3; // 30% bonus for location matches
            
            // For consecutive words matching
            let consecutiveMatches = 0;
            for (let i = 0; i < searchWords.length - 1; i++) {
              if (listingText.includes(`${searchWords[i]} ${searchWords[i + 1]}`)) {
                consecutiveMatches++;
              }
            }
            
            if (consecutiveMatches > 0) {
              relevanceScore += (consecutiveMatches / (totalWords - 1)) * 0.4; // Bonus for consecutive words
            }
            
            return {
              ...listing,
              relevanceScore
            };
          });
          
          // Filter out listings with low relevance (improved threshold)
          filteredData = filteredData.filter(listing => (listing as any).relevanceScore > 0.3);
          
          // Sort by relevance score (higher is better)
          filteredData.sort((a, b) => (b as any).relevanceScore - (a as any).relevanceScore);
        }
      }
      
      console.log("Marketplace listings fetched:", filteredData?.map(l => ({
        id: l.id,
        title: l.title,
        category: l.category,
        location: l.location,
        approval_status: l.approval_status,
        seller_id: l.seller_id,
        seller_rating: l.seller_rating,
        current_user_id: user?.id
      })));
      
      setListings(filteredData as MarketplaceListing[]);
    } catch (err) {
      console.error('Error fetching marketplace listings:', err);
      setError('Failed to fetch listings. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery, condition, minPrice, maxPrice, minRating, includeAllStatuses, user]);

  // Process natural language query by removing common connector words
  const processNaturalLanguageQuery = (query: string): string => {
    // List of common connector words/stopwords to remove
    const stopwords = ['in', 'at', 'near', 'around', 'by', 'the', 'a', 'an', 'for', 'with', 'to', 'from'];
    
    // Replace all commas with spaces for better tokenization
    let processedQuery = query.replace(/,/g, ' ');
    
    // Split into words and filter out stopwords
    const words = processedQuery.split(/\s+/).filter(word => 
      word.length > 0 && !stopwords.includes(word.toLowerCase())
    );
    
    // Special handling for certain patterns like "X in Y" where Y is likely a location
    const locationWords: string[] = [];
    const searchWords: string[] = [];
    
    // Look for location indicators and separate location terms
    let locationMode = false;
    
    words.forEach((word) => {
      // These words likely indicate the next word is a location
      if (['near', 'in', 'at', 'around', 'by'].includes(word.toLowerCase())) {
        locationMode = true;
        return; // Skip the connector word itself
      }
      
      if (locationMode) {
        locationWords.push(word);
      } else {
        searchWords.push(word);
      }
    });
    
    // Combine all words back, location words are still included as they're relevant for search
    const allRelevantWords = [...searchWords, ...locationWords];
    
    console.log('Original query:', query);
    console.log('Processed words:', allRelevantWords);
    console.log('Identified location terms:', locationWords);
    
    return allRelevantWords.join(' ');
  };

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return { 
    listings, 
    loading, 
    error, 
    refetch: fetchListings 
  };
};

export const useMarketplaceListing = (id: string) => {
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) {
        setError('No listing ID provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('marketplace_listings')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          setError('Listing not found');
        } else {
          setListing(data as MarketplaceListing);
        }
      } catch (err) {
        console.error('Error fetching marketplace listing:', err);
        setError('Failed to fetch listing details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  return { listing, loading, error };
};
