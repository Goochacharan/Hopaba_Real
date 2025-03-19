import { useState, useEffect } from 'react';
import { CategoryType } from '@/components/CategoryFilter';
import { useDebounce } from './useDebounce';
import { Recommendation, AppEvent, UseRecommendationsProps, FilterOptions } from '@/types/recommendation';
import { processNaturalLanguageQuery } from '@/services/queryProcessor';
import { 
  fetchServiceProviders, 
  fetchRecommendationsFromSupabase, 
  fetchEventsFromSupabase,
  fetchDefaultRecommendations,
  getYogaResults,
  searchEvents
} from '@/services/dataFetcher';
import { filterRecommendations } from '@/utils/filterUtils';
import { searchRecommendations } from '@/lib/mockData';

export type { AppEvent }; // Explicitly export AppEvent type

const useRecommendations = ({ 
  initialQuery = '', 
  initialCategory = 'all' 
}: UseRecommendationsProps = {}) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<CategoryType>(initialCategory);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Starting search with query:", debouncedQuery);
        const { processedQuery, inferredCategory } = processNaturalLanguageQuery(debouncedQuery, category);
        
        const effectiveCategory = inferredCategory;
        
        console.log("Effective search category:", effectiveCategory);
        console.log("Searching for:", processedQuery);
        
        // First fetch from recommendations table with improved search
        const supabaseRecommendations = await fetchRecommendationsFromSupabase(
          processedQuery, 
          effectiveCategory
        );
        
        // Then fetch from service_providers table with improved search
        const serviceProviders = await fetchServiceProviders(
          processedQuery,
          effectiveCategory
        );
        
        // Combine results from both tables
        let combinedResults: Recommendation[] = [];
        
        if (supabaseRecommendations && supabaseRecommendations.length > 0) {
          combinedResults = [...supabaseRecommendations];
        }
        
        if (serviceProviders && serviceProviders.length > 0) {
          combinedResults = [...combinedResults, ...serviceProviders];
        }
        
        // Remove duplicates by ID (in case the same entity appears in both tables)
        const uniqueResults = Array.from(
          new Map(combinedResults.map(item => [item.id, item])).values()
        );
        
        const supabaseEvents = await fetchEventsFromSupabase(processedQuery);
        
        if (uniqueResults.length > 0) {
          console.log("Using combined Supabase data with", uniqueResults.length, "results");
          setRecommendations(uniqueResults as Recommendation[]);
        } else {
          console.log("No Supabase results, using specialized handlers or mock data");
          
          if (debouncedQuery.toLowerCase().includes('yoga') || effectiveCategory === 'fitness') {
            console.log("Specialized handling for yoga query");
            const yogaResults = getYogaResults(debouncedQuery);
            setRecommendations(yogaResults as Recommendation[]);
          } else if (
            debouncedQuery.toLowerCase().includes('restaurant') || 
            debouncedQuery.toLowerCase().includes('food') || 
            debouncedQuery.toLowerCase().includes('fusion') || 
            debouncedQuery.toLowerCase().includes('seafood') || 
            debouncedQuery.toLowerCase().includes('spice') || 
            debouncedQuery.toLowerCase().includes('garden') || 
            debouncedQuery.toLowerCase().includes('ocean') || 
            effectiveCategory === 'restaurants'
          ) {
            console.log("Specialized handling for restaurant/food query");
            const restaurantResults = searchRecommendations(processedQuery, effectiveCategory);
            setRecommendations(restaurantResults as Recommendation[]);
          } else {
            console.log("Search query:", processedQuery);
            console.log("Normalized query:", processedQuery.toLowerCase());
            
            await new Promise(resolve => setTimeout(resolve, 500));
            const locationResults = searchRecommendations(processedQuery, effectiveCategory);
            setRecommendations(locationResults as Recommendation[]);
          }
        }
        
        if (supabaseEvents && supabaseEvents.length > 0) {
          console.log("Using Supabase events data");
          setEvents(supabaseEvents);
        } else {
          console.log("No Supabase events, using mock events data");
          const matchingEvents = searchEvents(processedQuery);
          setEvents(matchingEvents);
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to fetch recommendations. Please try again.');
        setRecommendations([]);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    if (debouncedQuery) {
      fetchRecommendations();
    } else {
      const fetchDefaultResults = async () => {
        setLoading(true);
        try {
          const defaultRecommendations = await fetchDefaultRecommendations();
          setRecommendations(defaultRecommendations);
        } catch (err) {
          console.error("Failed to fetch default recommendations:", err);
          setError('Failed to fetch recommendations. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchDefaultResults();
      setEvents([]);
    }
  }, [debouncedQuery, category]);

  
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const handleCategoryChange = (newCategory: CategoryType) => {
    console.log("Category changed to:", newCategory);
    setCategory(newCategory);
  };

  return {
    recommendations,
    events,
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
