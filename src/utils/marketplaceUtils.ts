
import { MarketplaceListing } from '../types/marketplace';
import { processNaturalLanguageQuery, calculateListingRelevanceScore } from './searchUtils';

/**
 * Filter and sort listings by search query with advanced relevance scoring
 */
export const filterListingsBySearchQuery = (
  listings: MarketplaceListing[],
  searchQuery: string
): MarketplaceListing[] => {
  if (!searchQuery || searchQuery.trim() === '') {
    return listings;
  }
  
  const processedSearchQuery = processNaturalLanguageQuery(searchQuery.trim().toLowerCase());
  const searchWords = processedSearchQuery.split(/\s+/).filter(word => word.length > 2);
  
  if (searchWords.length === 0) {
    return listings;
  }
  
  // Calculate relevance score for each listing
  const scoredListings = listings.map(listing => {
    const relevanceScore = calculateListingRelevanceScore(listing, searchWords);
    return {
      ...listing,
      relevanceScore
    };
  });
  
  // Filter out listings with low relevance
  const filteredListings = scoredListings.filter(listing => 
    (listing as any).relevanceScore > 0.2
  );
  
  // Sort by relevance score (higher is better)
  filteredListings.sort((a, b) => (b as any).relevanceScore - (a as any).relevanceScore);
  
  return filteredListings as MarketplaceListing[];
};
