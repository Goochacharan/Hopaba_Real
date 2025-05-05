
import { useState, useEffect } from 'react';
import { CategoryType } from '@/components/CategoryFilter';
import { UseRecommendationsProps, FilterOptions, Event } from './types/recommendationTypes';
import { fetchServiceProviders, fetchEvents } from '@/services/recommendationService';
import { processNaturalLanguageQuery } from '@/utils/queryUtils';
import { Recommendation } from '@/lib/mockData';

const useRecommendations = ({ 
  initialQuery = '', 
  initialCategory = 'all',
  loadDefaultResults = false
}: UseRecommendationsProps = {}) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<CategoryType>(initialCategory);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filterRecommendations = (
    recs: Recommendation[],
    filterOptions: FilterOptions
  ): Recommendation[] => {
    const { distanceUnit = 'mi' } = filterOptions;
    
    return recs.filter(rec => {
      if (rec.rating < filterOptions.minRating) return false;
      if (filterOptions.openNow && !rec.openNow) return false;
      if (filterOptions.hiddenGem && !rec.isHiddenGem) return false;
      if (filterOptions.mustVisit && !rec.isMustVisit) return false;

      if (rec.distance) {
        const distanceValue = parseFloat(rec.distance.split(' ')[0]);
        if (!isNaN(distanceValue)) {
          const adjustedDistance = distanceUnit === 'km' ? distanceValue : distanceValue * 1.60934;
          if (adjustedDistance > filterOptions.maxDistance) return false;
        }
      }

      if (rec.priceLevel) {
        const priceCount = rec.priceLevel.length;
        if (priceCount > filterOptions.priceLevel) return false;
      }

      return true;
    });
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const handleCategoryChange = (newCategory: CategoryType) => {
    setCategory(newCategory);
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (query) {
          const { processedQuery, inferredCategory } = processNaturalLanguageQuery(query.toLowerCase(), category);
          const effectiveCategory = inferredCategory;
          const serviceProviders = await fetchServiceProviders(processedQuery, effectiveCategory);
          
          // Enhanced tag search: Filter results to include businesses with matching tags
          const enhancedResults = serviceProviders.map(provider => {
            // Add a searchScore property to each provider based on tag matches
            const tagMatches = Array.isArray(provider.tags) && 
              provider.tags.some(tag => 
                tag.toLowerCase().includes(processedQuery.toLowerCase())
              );
            
            return {
              ...provider,
              searchScore: tagMatches ? 10 : 0 // Give a high score for tag matches
            };
          });
          
          // Sort results by search score (tag matches first)
          const sortedResults = [...enhancedResults].sort((a, b) => 
            (b.searchScore || 0) - (a.searchScore || 0)
          );
          
          setRecommendations(sortedResults);
          const eventsData = await fetchEvents(processedQuery);
          setEvents(eventsData);
        } 
        else if (loadDefaultResults) {
          const serviceProviders = await fetchServiceProviders('', category);
          setRecommendations(serviceProviders);
          const eventsData = await fetchEvents('');
          setEvents(eventsData);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch recommendations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [query, category, loadDefaultResults]);

  return {
    query,
    setQuery,
    category,
    setCategory,
    recommendations,
    events,
    loading,
    error,
    filterRecommendations,
    handleSearch,
    handleCategoryChange
  };
};

export default useRecommendations;
