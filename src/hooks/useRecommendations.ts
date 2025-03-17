import { useState, useEffect } from 'react';
import { Recommendation, mockRecommendations, searchRecommendations } from '@/lib/mockData';
import { CategoryType } from '@/components/CategoryFilter';

interface UseRecommendationsProps {
  initialQuery?: string;
  initialCategory?: CategoryType;
}

interface FilterOptions {
  maxDistance: number;
  minRating: number;
  priceLevel: number;
  openNowOnly: boolean;
}

// Keywords for better natural language understanding
const keywordMap = {
  // Locations
  'near me': ['nearby', 'close', 'close by', 'around me', 'in my area', 'local'],
  'indiranagar': ['indiranagar', 'indira nagar', 'indranagar'],
  'koramangala': ['koramangala', 'kormangala'],
  'malleshwaram': ['malleshwaram', 'malleswaram', 'malleshwar'],
  'nagarbhavi': ['nagarbhavi', 'nagar bhavi', 'nagarbavi'],
  'jayanagar': ['jayanagar', 'jaya nagar', 'jaynagar'],
  
  // Categories
  'restaurant': ['restaurant', 'dining', 'place to eat', 'eatery', 'food place', 'dinner', 'biryani'],
  'cafe': ['cafe', 'coffee shop', 'coffee place', 'coffee house', 'bakery'],
  'salon': ['salon', 'saloon', 'haircut', 'hair stylist', 'spa', 'beauty parlor', 'barber'],
  'school': ['school', 'academy', 'class', 'teacher', 'tutor', 'instructor', 'lessons'],
  'plumber': ['plumber', 'plumbing', 'pipe repair', 'water leak', 'tap repair'],
  
  // Attributes
  'good': ['good', 'best', 'top', 'great', 'excellent', 'amazing', 'fantastic', 'quality'],
  'cheap': ['cheap', 'affordable', 'budget', 'inexpensive', 'reasonable', 'economical'],
  'expensive': ['expensive', 'high-end', 'luxury', 'premium', 'upscale'],
  'open': ['open', 'available', 'open now', 'available now', 'right now', 'currently'],
  'veg': ['veg', 'vegetarian', 'pure veg'],
  'non-veg': ['non-veg', 'non vegetarian', 'nonveg', 'meat', 'chicken', 'beef', 'pork'],
  'hidden gem': ['hidden gem', 'underrated', 'secret', 'unknown', 'not popular', 'undiscovered'],
  'popular': ['popular', 'crowded', 'well known', 'famous', 'trending', 'busy']
};

// Common search patterns to help categorize queries
const searchPatterns = [
  { pattern: /cafe|coffee/i, category: 'cafes' },
  { pattern: /restaurant|food|eat|dining|biryani/i, category: 'restaurants' },
  { pattern: /salon|haircut|barber|beauty|spa/i, category: 'salons' },
  { pattern: /plumber|plumbing|pipe|leak|tap/i, category: 'services' },
  { pattern: /doctor|clinic|hospital|health/i, category: 'health' },
  { pattern: /shop|store|mall|buy/i, category: 'shopping' },
  { pattern: /school|college|class|teacher|tutor/i, category: 'education' },
];

const useRecommendations = ({ 
  initialQuery = '', 
  initialCategory = 'all' 
}: UseRecommendationsProps = {}) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<CategoryType>(initialCategory);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Process natural language query to extract intent
  const processNaturalLanguageQuery = (rawQuery: string) => {
    const lowercaseQuery = rawQuery.toLowerCase();
    let processedQuery = lowercaseQuery;
    let inferredCategory: CategoryType = 'all';
    
    // First, try to infer category from query using patterns
    for (const { pattern, category } of searchPatterns) {
      if (pattern.test(lowercaseQuery)) {
        inferredCategory = category as CategoryType;
        break;
      }
    }

    // If no pattern matched but query contains keywords, try to infer from them
    if (inferredCategory === 'all') {
      if (lowercaseQuery.includes('cafe') || lowercaseQuery.includes('coffee')) {
        inferredCategory = 'cafes';
      } else if (lowercaseQuery.includes('salon') || lowercaseQuery.includes('haircut')) {
        inferredCategory = 'salons';
      } else if (lowercaseQuery.includes('plumber')) {
        inferredCategory = 'services';
      } else if (lowercaseQuery.includes('biryani')) {
        inferredCategory = 'restaurants';
      }
    }
    
    // Set the category if we inferred one
    if (inferredCategory !== 'all') {
      setCategory(inferredCategory);
    }
    
    // Add "near me" if user is just searching for a type of place
    if (
      !lowercaseQuery.includes('near') && 
      !lowercaseQuery.includes('in ') &&
      (lowercaseQuery.includes('cafe') || 
       lowercaseQuery.includes('restaurant') || 
       lowercaseQuery.includes('salon') || 
       lowercaseQuery.includes('plumber') ||
       lowercaseQuery.includes('biryani'))
    ) {
      processedQuery = `${processedQuery} near me`;
    }
    
    // Expand query with synonyms
    Object.entries(keywordMap).forEach(([key, synonyms]) => {
      synonyms.forEach(synonym => {
        if (lowercaseQuery.includes(synonym)) {
          // Replace all occurrences of the synonym with the key term
          processedQuery = processedQuery.replace(new RegExp(synonym, 'g'), key);
        }
      });
    });
    
    console.log(`Original query: "${lowercaseQuery}"`);
    console.log(`Processed query: "${processedQuery}"`);
    console.log(`Inferred category: ${inferredCategory}`);
    
    return processedQuery;
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Process the natural language query
        const processedQuery = processNaturalLanguageQuery(query);
        
        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const results = searchRecommendations(processedQuery, category);
        
        // Add multiple images to each result if not already present
        const resultsWithImages = results.map(result => {
          if (result.images && result.images.length > 0) {
            return result;
          }
          
          // Generate array of images based on the main image
          // This creates variations based on the primary image URL
          // In a real app, these would come from the backend
          const mainImage = result.image;
          const baseUrl = mainImage.split('?')[0]; // Remove any query params
          const images = [
            mainImage,
            `${baseUrl}?v=2`,
            `${baseUrl}?v=3`,
          ];
          
          return {
            ...result,
            images
          };
        });
        
        setRecommendations(resultsWithImages);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to fetch recommendations. Please try again.');
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchRecommendations();
    } else {
      // If no query, just load some default recommendations
      const defaultResults = mockRecommendations.slice(0, 6);
      setRecommendations(defaultResults);
      setLoading(false);
    }
  }, [query, category]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const handleCategoryChange = (newCategory: CategoryType) => {
    setCategory(newCategory);
  };

  const filterRecommendations = (
    recs: Recommendation[],
    filterOptions: FilterOptions
  ): Recommendation[] => {
    return recs.filter(rec => {
      // Filter by rating
      if (rec.rating < filterOptions.minRating) {
        return false;
      }

      // Filter by open now
      if (filterOptions.openNowOnly && !rec.openNow) {
        return false;
      }

      // Filter by distance (if available)
      if (rec.distance) {
        const distanceValue = parseFloat(rec.distance.split(' ')[0]);
        if (!isNaN(distanceValue) && distanceValue > filterOptions.maxDistance) {
          return false;
        }
      }

      // Filter by price level
      if (rec.priceLevel) {
        const priceCount = rec.priceLevel.length;
        if (priceCount > filterOptions.priceLevel) {
          return false;
        }
      }

      return true;
    });
  };

  return {
    recommendations,
    loading,
    error,
    query,
    category,
    handleSearch,
    handleCategoryChange,
    filterRecommendations
  };
};

export default useRecommendations;
