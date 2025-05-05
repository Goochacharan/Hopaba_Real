
import { calculateDistance, extractCoordinatesFromMapLink } from '@/lib/locationUtils';
import { Recommendation } from '@/hooks/types/recommendationTypes';

export const addDistanceToRecommendations = (recs: Recommendation[], userCoordinates: {lat: number, lng: number} | null) => {
  if (!userCoordinates) return recs;
  
  return recs.map(rec => {
    let latitude: number | null = null;
    let longitude: number | null = null;
    
    // Try to extract coordinates from map_link if available
    if (rec.map_link) {
      const coordinates = extractCoordinatesFromMapLink(rec.map_link);
      if (coordinates) {
        latitude = coordinates.lat;
        longitude = coordinates.lng;
      }
    }
    
    // Fallback to generated coordinates if extraction fails
    if (latitude === null || longitude === null) {
      latitude = parseFloat(rec.id) % 0.1 + 12.9716;
      longitude = parseFloat(rec.id) % 0.1 + 77.5946;
    }
    
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
    // First prioritize tag matches if available
    if ((a.isTagMatch === true) && (b.isTagMatch !== true)) return -1;
    if ((a.isTagMatch !== true) && (b.isTagMatch === true)) return 1;
    
    // Then proceed with normal sorting
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
    // Add tag matching debugging info
    const tagMatches = rec.tagMatches || [];
    const isTagMatch = rec.isTagMatch || false;
    
    if (isTagMatch) {
      console.log(`Enhanced recommendation "${rec.name}" has tag matches: ${tagMatches.join(', ')}`);
    }
    
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
      isMustVisit: rec.isMustVisit,
      tagMatches: tagMatches,
      isTagMatch: isTagMatch
    };
  });
};

// New function to highlight tag matches in search results
export const highlightTagMatches = (text: string, tags: string[]): string => {
  if (!tags || tags.length === 0) return text;
  
  let result = text;
  tags.forEach(tag => {
    const tagRegex = new RegExp(tag, 'gi');
    result = result.replace(tagRegex, match => `<mark>${match}</mark>`);
  });
  
  return result;
};

// Function to check if a word, partial word or phrase matches 
export const matchWordOrPhrase = (source: string, target: string): boolean => {
  if (!source || !target) return false;
  
  const sourceWords = source.toLowerCase().split(/\s+/);
  const targetWords = target.toLowerCase().split(/\s+/);
  
  // Check for exact phrase match
  if (source.toLowerCase().includes(target.toLowerCase())) {
    return true;
  }
  
  // Check if any target word is included in any source word
  for (const targetWord of targetWords) {
    if (targetWord.length < 3) continue; // Skip very short words
    
    for (const sourceWord of sourceWords) {
      if (sourceWord.includes(targetWord) || targetWord.includes(sourceWord)) {
        return true;
      }
    }
  }
  
  return false;
};
