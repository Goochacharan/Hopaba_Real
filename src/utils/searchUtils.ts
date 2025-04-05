import { calculateDistance } from '@/lib/locationUtils';
import { Recommendation } from '@/lib/mockData';

export const addDistanceToRecommendations = (recs: Recommendation[], userCoordinates: {lat: number, lng: number} | null) => {
  if (!userCoordinates) return recs;
  
  return recs.map(rec => {
    const latitude = parseFloat(rec.id) % 0.1 + 12.9716;
    const longitude = parseFloat(rec.id) % 0.1 + 77.5946;
    
    const distanceValue = calculateDistance(
      userCoordinates.lat,
      userCoordinates.lng,
      latitude,
      longitude,
      'K'
    );
    
    return {
      ...rec,
      calculatedDistance: distanceValue,
      distance: `${distanceValue.toFixed(1)} km away`
    };
  });
};

export const sortRecommendations = (recommendations: Recommendation[], sortBy: string) => {
  return [...recommendations].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'distance':
        if (a.calculatedDistance !== undefined && b.calculatedDistance !== undefined) {
          return a.calculatedDistance - b.calculatedDistance;
        }
        const distanceA = parseFloat(a.distance?.split(' ')[0] || '0');
        const distanceB = parseFloat(b.distance?.split(' ')[0] || '0');
        return distanceA - distanceB;
      case 'reviewCount':
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      case 'newest':
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      default:
        return 0;
    }
  });
};

export const enhanceRecommendations = (recommendations: Recommendation[]) => {
  return recommendations.map(rec => {
    return {
      ...rec,
      hours: rec.hours || rec.availability,
      price_range_min: rec.price_range_min,
      price_range_max: rec.price_range_max,
      price_unit: rec.price_unit,
      availability: rec.availability,
      availability_days: rec.availability_days || [],
      availability_start_time: rec.availability_start_time || '',
      availability_end_time: rec.availability_end_time || '',
      instagram: rec.instagram || '',
      map_link: rec.map_link,
      isHiddenGem: rec.isHiddenGem,
      isMustVisit: rec.isMustVisit
    };
  });
};

// Improved utility function to match search terms against tags
export const matchSearchTermsWithTags = (searchQuery: string, tags: string[] | undefined): boolean => {
  if (!searchQuery || !tags || !Array.isArray(tags) || tags.length === 0) return false;

  // Process the search query to get individual terms
  const searchTerms = searchQuery.toLowerCase()
    .replace(/,/g, ' ')  // Replace commas with spaces
    .split(/\s+/)        // Split by spaces 
    .filter(term => term.length >= 2); // Only terms with at least 2 characters
  
  if (searchTerms.length === 0) return false;

  // Check if any search term matches any tag
  return searchTerms.some(term => {
    return tags.some(tag => {
      if (typeof tag !== 'string') return false;
      const normalizedTag = tag.toLowerCase();
      
      // Check for direct matches or partial matches with word boundaries
      return normalizedTag === term || 
             normalizedTag.includes(term) || 
             term.includes(normalizedTag);
    });
  });
};

// Function to score how well a business/service matches search terms
export const calculateSearchRelevance = (
  item: { 
    name?: string; 
    title?: string;
    description?: string; 
    tags?: string[]; 
    category?: string;
    address?: string;
    location?: string;
  }, 
  searchQuery: string
): number => {
  if (!searchQuery) return 0;
  
  const terms = searchQuery.toLowerCase().split(/[\s,]+/).filter(t => t.length >= 2);
  if (terms.length === 0) return 0;
  
  let score = 0;
  const name = item.name || item.title || '';
  const description = item.description || '';
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const category = item.category || '';
  const location = item.address || item.location || '';
  
  // Score direct name matches highly
  if (name && terms.some(term => name.toLowerCase().includes(term))) {
    score += 10;
    // Bonus for exact name match
    if (terms.some(term => name.toLowerCase() === term)) {
      score += 5;
    }
  }
  
  // Score tag matches
  if (tags.length > 0) {
    const tagMatchCount = terms.reduce((count, term) => {
      return count + tags.filter(tag => 
        tag && typeof tag === 'string' && tag.toLowerCase().includes(term)
      ).length;
    }, 0);
    
    score += tagMatchCount * 8; // Tags are highly relevant
  }
  
  // Score category matches
  if (category && terms.some(term => category.toLowerCase().includes(term))) {
    score += 7;
  }
  
  // Score description matches
  if (description && terms.some(term => description.toLowerCase().includes(term))) {
    score += 3;
  }
  
  // Score location matches
  if (location && terms.some(term => location.toLowerCase().includes(term))) {
    score += 4;
  }
  
  return score;
};

// New function to improve search across locations, events, and marketplace
export const improveSearchByTags = <T extends { tags?: string[] }>(
  items: T[],
  searchQuery: string
): { items: T[], tagMatches: string[] } => {
  if (!searchQuery) return { items, tagMatches: [] };
  
  const searchTerms = searchQuery.toLowerCase()
    .replace(/,/g, ' ')
    .split(/\s+/)
    .filter(term => term.length >= 2);
  
  if (searchTerms.length === 0) return { items, tagMatches: [] };
  
  // Track which tags were matched
  const matchedTags: string[] = [];
  
  // Count items that match any tag
  const itemsWithTagMatch = items.filter(item => {
    const tags = item.tags || [];
    const hasMatch = tags.some(tag => {
      if (typeof tag !== 'string') return false;
      const tagLower = tag.toLowerCase();
      
      const matchesAnyTerm = searchTerms.some(term => {
        const isMatch = tagLower === term || tagLower.includes(term) || term.includes(tagLower);
        if (isMatch && !matchedTags.includes(tag)) {
          matchedTags.push(tag);
        }
        return isMatch;
      });
      
      return matchesAnyTerm;
    });
    
    return hasMatch;
  });
  
  return {
    items: itemsWithTagMatch.length > 0 ? itemsWithTagMatch : items,
    tagMatches: matchedTags
  };
};
