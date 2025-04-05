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
        const searchWords = processedSearchQuery.split(/\s+/).filter(word => word.length > 2);
        
        if (searchWords.length > 0) {
          // Create a complex OR condition for each word across multiple fields
          // This allows searching for "rambhavan muddinpallya" to match listings where either word appears in any key field
          const orConditions = searchWords.map(word => {
            return `title.ilike.%${word}%,description.ilike.%${word}%,category.ilike.%${word}%,location.ilike.%${word}%,seller_name.ilike.%${word}%`;
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
        const searchWords = processedSearchQuery.split(/\s+/).filter(word => word.length > 2);
        
        if (searchWords.length > 0) {
          // Calculate a relevance score for each listing based on how many search words it contains across different fields
          filteredData = filteredData.map(listing => {
            // Combine all relevant text fields into one searchable text
            const listingText = `${listing.title} ${listing.description} ${listing.category} ${listing.location} ${listing.seller_name}`.toLowerCase();
            
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

            // Increase score for seller name matches
            const sellerNameMatches = searchWords.filter(word => 
              listing.seller_name.toLowerCase().includes(word)
            ).length;
            
            // Add bonuses for matches in different fields
            relevanceScore += (titleMatches / totalWords) * 0.5; // 50% bonus for title matches
            relevanceScore += (locationMatches / totalWords) * 0.4; // 40% bonus for location matches
            relevanceScore += (sellerNameMatches / totalWords) * 0.3; // 30% bonus for seller name matches
            
            // Special case: If all words appear somewhere in the listing, give a big boost
            if (matchedWords.length === searchWords.length) {
              relevanceScore += 0.5;
            }
            
            // For consecutive words matching
            for (let i = 0; i < searchWords.length - 1; i++) {
              if (listingText.includes(`${searchWords[i]} ${searchWords[i + 1]}`)) {
                relevanceScore += 0.4; // Big boost for consecutive word matches
              }
            }

            // Check for cross-field matches (e.g., one word in title, another in location)
            // This specifically helps with cases like "Rambhavan muddinpallya"
            if (searchWords.length >= 2) {
              const titleWords = listing.title.toLowerCase().split(/\s+/);
              const locationWords = listing.location.toLowerCase().split(/\s+/);
              const descriptionWords = listing.description.toLowerCase().split(/\s+/);
              
              // Check if different search words match in different fields
              const hasFieldCrossing = searchWords.some(word => 
                titleWords.includes(word)
              ) && searchWords.some(word => 
                locationWords.includes(word) || descriptionWords.includes(word)
              );
              
              if (hasFieldCrossing) {
                relevanceScore += 0.6; // Significant boost for cross-field matching
              }
            }
            
            return {
              ...listing,
              relevanceScore
            };
          });
          
          // Filter out listings with low relevance (improved threshold)
          filteredData = filteredData.filter(listing => (listing as any).relevanceScore > 0.2);
          
          // Sort by relevance score (higher is better)
          filteredData.sort((a, b) => (b as any).relevanceScore - (a as any).relevanceScore);
        }
      }
      
      console.log("Marketplace listings fetched:", filteredData?.map(l => ({
        id: l.id,
        title: l.title,
        location: l.location,
        approval_status: l.approval_status,
        seller_id: l.seller_id,
        seller_name: l.seller_name,
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
    const stopwords = ['in', 'at', 'near', 'around', 'by', 'the', 'a', 'an', 'for', 'with', 'to', 'from', 'and', 'or'];
    
    // Replace all commas with spaces for better tokenization
    let processedQuery = query.replace(/,/g, ' ');
    
    // Split into words and filter out stopwords, but keep location terms
    const allWords = processedQuery.split(/\s+/).filter(word => word.length > 0);
    
    // First pass: identify location terms
    const possibleLocations: string[] = [];
    let locationMode = false;
    
    // Look for location indicators
    for (let i = 0; i < allWords.length; i++) {
      const word = allWords[i].toLowerCase();
      
      // These words likely indicate the next word is a location
      if (['in', 'at', 'near', 'around', 'by'].includes(word) && i < allWords.length - 1) {
        possibleLocations.push(allWords[i + 1]);
        locationMode = true;
      } else if (locationMode && !stopwords.includes(word)) {
        possibleLocations.push(word);
      } else {
        locationMode = false;
      }
    }
    
    // Second pass: build the processed query
    const processedWords = allWords.filter(word => 
      !stopwords.includes(word.toLowerCase()) || possibleLocations.includes(word)
    );
    
    console.log('Original query:', query);
    console.log('Processed words:', processedWords);
    console.log('Identified location terms:', possibleLocations);
    
    return processedWords.join(' ');
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
