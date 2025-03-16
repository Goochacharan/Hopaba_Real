
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

const useRecommendations = ({ 
  initialQuery = '', 
  initialCategory = 'all' 
}: UseRecommendationsProps = {}) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<CategoryType>(initialCategory);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const results = searchRecommendations(query, category);
        
        // Add multiple images to each result if not already present
        const resultsWithImages = results.map(result => {
          if (Array.isArray(result.images) && result.images.length > 0) {
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

    fetchRecommendations();
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
