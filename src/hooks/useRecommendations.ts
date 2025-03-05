
import { useState, useEffect } from 'react';
import { Recommendation, mockRecommendations, searchRecommendations } from '@/lib/mockData';
import { CategoryType } from '@/components/CategoryFilter';

interface UseRecommendationsProps {
  initialQuery?: string;
  initialCategory?: CategoryType;
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
        setRecommendations(results);
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

  return {
    recommendations,
    loading,
    error,
    query,
    category,
    handleSearch,
    handleCategoryChange
  };
};

export default useRecommendations;
