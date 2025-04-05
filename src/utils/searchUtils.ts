
// Add natural language search processing utilities

/**
 * Process natural language query by removing common connector words
 */
export const processNaturalLanguageQuery = (query: string): string => {
  const stopwords = ['in', 'at', 'near', 'around', 'by', 'the', 'a', 'an', 'for', 'with', 'to', 'from', 'and', 'or'];
  
  let processedQuery = query.replace(/,/g, ' ');
  
  const allWords = processedQuery.split(/\s+/).filter(word => word.length > 0);
  
  let possibleLocations: string[] = [];
  let locationMode = false;
  
  for (let i = 0; i < allWords.length; i++) {
    const word = allWords[i].toLowerCase();
    
    if (['in', 'at', 'near', 'around', 'by'].includes(word) && i < allWords.length - 1) {
      possibleLocations.push(allWords[i + 1]);
      locationMode = true;
    } else if (locationMode && !stopwords.includes(word)) {
      possibleLocations.push(word);
    } else {
      locationMode = false;
    }
  }
  
  const processedWords = allWords.filter(word => 
    !stopwords.includes(word.toLowerCase()) || possibleLocations.includes(word)
  );
  
  console.log('Original query:', query);
  console.log('Processed words:', processedWords);
  console.log('Identified location terms:', possibleLocations);
  
  return processedWords.join(' ');
};

/**
 * Calculate relevance score for listing based on search terms
 */
export const calculateListingRelevanceScore = (listing: any, searchWords: string[]): number => {
  // Combine all relevant text fields into one searchable text
  const tagsArray = listing.tags || [];
  const tagText = Array.isArray(tagsArray) ? tagsArray.join(' ') : '';
  
  const listingText = `${listing.title} ${listing.description} ${listing.category} ${listing.location} ${listing.seller_name} ${tagText}`.toLowerCase();
  
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
  
  // Increase score for tag matches
  const tagMatches = searchWords.filter(word => {
    if (!listing.tags) return false;
    if (!Array.isArray(listing.tags)) return false;
    return listing.tags.some(tag => 
      tag.toLowerCase().includes(word)
    );
  }).length;
  
  // Add bonuses for matches in different fields
  relevanceScore += (titleMatches / totalWords) * 0.5; // 50% bonus for title matches
  relevanceScore += (locationMatches / totalWords) * 0.4; // 40% bonus for location matches
  relevanceScore += (sellerNameMatches / totalWords) * 0.3; // 30% bonus for seller name matches
  relevanceScore += (tagMatches / totalWords) * 0.5; // 50% bonus for tag matches
  
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

  // Check for cross-field matches (e.g., one word in title, another in location, another in tags)
  if (searchWords.length >= 2) {
    const titleWords = listing.title.toLowerCase().split(/\s+/);
    const locationWords = listing.location.toLowerCase().split(/\s+/);
    const descriptionWords = listing.description.toLowerCase().split(/\s+/);
    
    // Safely handle tags as they might be undefined
    const tagWords = listing.tags && Array.isArray(listing.tags) 
      ? listing.tags.flatMap(tag => tag.toLowerCase().split(/\s+/))
      : [];
    
    // Check if different search words match in different fields
    const hasFieldCrossing = (
      searchWords.some(word => titleWords.includes(word)) && 
      (
        searchWords.some(word => locationWords.includes(word) || descriptionWords.includes(word)) ||
        searchWords.some(word => tagWords.includes(word))
      )
    ) || (
      searchWords.some(word => tagWords.includes(word)) && 
      searchWords.some(word => locationWords.includes(word))
    );
    
    if (hasFieldCrossing) {
      relevanceScore += 0.6; // Significant boost for cross-field matching
    }
  }
  
  return relevanceScore;
};
