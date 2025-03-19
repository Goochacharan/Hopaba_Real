import { useState, useEffect } from 'react';
import { Recommendation, mockRecommendations, searchRecommendations } from '@/lib/mockData';
import { CategoryType } from '@/components/CategoryFilter';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from './useDebounce';

const searchPatterns = [
  { pattern: /yoga|meditation|fitness|gym/, category: 'fitness' },
  { pattern: /restaurant|food|dinner|lunch|eat/, category: 'restaurants' },
  { pattern: /cafe|coffee|bakery/, category: 'cafes' },
  { pattern: /salon|haircut|barber|spa/, category: 'salons' },
  { pattern: /doctor|clinic|hospital|dentist/, category: 'health' },
  { pattern: /shop|store|market|mall/, category: 'shopping' },
  { pattern: /hotel|stay|accommodation/, category: 'hotels' }
];

const keywordMap: Record<string, string[]> = {
  'restaurant': ['dining', 'eatery', 'bistro', 'diner'],
  'cafe': ['coffee shop', 'café', 'espresso bar'],
  'near': ['around', 'close to', 'nearby', 'in the vicinity of'],
  'salon': ['hair salon', 'beauty parlor', 'stylist'],
  'best': ['top', 'highly rated', 'excellent', 'premium']
};

const yogaAndFitnessMockData: Recommendation[] = [
  {
    id: 'yoga1',
    name: 'Serenity Yoga Studio',
    category: 'Fitness',
    tags: ['Yoga', 'Beginners', 'Meditation'],
    rating: 4.8,
    address: '123 Zen Street, Indiranagar, Bangalore',
    distance: '0.6 miles away',
    image: 'https://images.unsplash.com/photo-1570655652364-2e0a67455ac6',
    images: ['https://images.unsplash.com/photo-1570655652364-2e0a67455ac6'],
    description: 'Peaceful yoga studio offering classes for all levels with focus on proper alignment and mindful practice.',
    phone: '+919876543230',
    openNow: true,
    hours: 'Until 9:00 PM',
    priceLevel: '$$',
    reviewCount: 89
  },
  {
    id: 'yoga2',
    name: 'Namaste Yoga Center',
    category: 'Fitness',
    tags: ['Yoga', 'Hatha', 'Vinyasa'],
    rating: 4.7,
    address: '456 Harmony Road, Koramangala, Bangalore',
    distance: '1.2 miles away',
    image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f',
    images: ['https://images.unsplash.com/photo-1588286840104-8957b019727f'],
    description: 'Traditional yoga center offering Hatha and Vinyasa classes with experienced instructors in a calming environment.',
    phone: '+919876543231',
    openNow: true,
    hours: 'Until 8:30 PM',
    priceLevel: '$$',
    reviewCount: 67
  },
  {
    id: 'yoga3',
    name: 'Flow Yoga & Wellness',
    category: 'Fitness',
    tags: ['Yoga', 'Beginners', 'Workshops'],
    rating: 4.9,
    address: '789 Peaceful Lane, Jayanagar, Bangalore',
    distance: '0.8 miles away',
    image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5',
    images: ['https://images.unsplash.com/photo-1599447421416-3414500d18a5'],
    description: 'Wellness-focused yoga studio with special workshops for beginners and programs for stress relief and flexibility.',
    phone: '+919876543232',
    openNow: false,
    hours: 'Opens tomorrow at 6:00 AM',
    priceLevel: '$$$',
    reviewCount: 102
  }
];

export interface AppEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  attendees: number;
}

const sampleEvents: AppEvent[] = [
  {
    id: 'event1',
    title: 'Summer Food Festival',
    date: 'July 15, 2023',
    time: '11:00 AM - 8:00 PM',
    location: 'Central Park, San Francisco',
    description: 'A culinary celebration featuring over 30 local restaurants, live cooking demonstrations, and music performances.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
    attendees: 215
  },
  {
    id: 'event2',
    title: 'Weekend Art Exhibition',
    date: 'July 22-23, 2023',
    time: '10:00 AM - 6:00 PM',
    location: 'Modern Art Gallery, Indiranagar',
    description: 'Showcasing works from emerging local artists with interactive sessions and workshops throughout the weekend.',
    image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e4',
    attendees: 98
  },
  {
    id: 'event3',
    title: 'Wellness & Yoga Retreat',
    date: 'August 5, 2023',
    time: '7:00 AM - 4:00 PM',
    location: 'Sunset Beach, Koramangala',
    description: 'A day-long retreat with yoga sessions, meditation workshops, and healthy living seminars led by certified instructors.',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0',
    attendees: 42
  },
  {
    id: 'event4',
    title: 'Yoga for Beginners Workshop',
    date: 'August 20, 2023',
    time: '9:00 AM - 12:00 PM',
    location: 'Serenity Yoga Studio, Indiranagar',
    description: 'A beginner-friendly workshop introducing fundamental yoga poses, breathing techniques, and mindfulness practices for newcomers.',
    image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5',
    attendees: 32
  }
];

interface UseRecommendationsProps {
  initialQuery?: string;
  initialCategory?: CategoryType;
}

interface FilterOptions {
  maxDistance: number;
  minRating: number;
  priceLevel: number;
  openNowOnly: boolean;
  distanceUnit?: 'km' | 'mi';
}

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
  
  const processNaturalLanguageQuery = (rawQuery: string) => {
    const lowercaseQuery = rawQuery.toLowerCase();
    let processedQuery = lowercaseQuery;
    let inferredCategory: CategoryType = category === 'all' ? 'all' : category;
    
    console.log('Original query:', `"${lowercaseQuery}"`);
    
    if (inferredCategory !== 'all') {
      console.log(`Using provided category: ${inferredCategory}`);
    } 
    else {
      if (lowercaseQuery.includes('yoga')) {
        inferredCategory = 'fitness';
        console.log('Detected yoga in query, setting category to fitness');
      } else if (lowercaseQuery.includes('restaurant')) {
        inferredCategory = 'restaurants';
        console.log('Detected restaurant in query, setting category to restaurants');
      } else if (lowercaseQuery.includes('café') || lowercaseQuery.includes('cafe') || lowercaseQuery.includes('coffee')) {
        inferredCategory = 'cafes';
        console.log('Detected café/coffee in query, setting category to cafes');
      } else {
        for (const { pattern, category } of searchPatterns) {
          if (pattern.test(lowercaseQuery)) {
            inferredCategory = category as CategoryType;
            console.log(`Matched pattern ${pattern}, setting category to ${category}`);
            break;
          }
        }
      }
    }
    
    if (inferredCategory === 'all') {
      if (lowercaseQuery.includes('salon') || lowercaseQuery.includes('haircut')) {
        inferredCategory = 'salons';
      } else if (lowercaseQuery.includes('plumber')) {
        inferredCategory = 'services';
      } else if (lowercaseQuery.includes('biryani') || 
                 lowercaseQuery.includes('food') || 
                 lowercaseQuery.includes('dinner') || 
                 lowercaseQuery.includes('lunch') ||
                 lowercaseQuery.includes('breakfast')) {
        inferredCategory = 'restaurants';
      }
    }
    
    if (inferredCategory !== 'all' && inferredCategory !== category) {
      console.log(`Setting category state to: ${inferredCategory}`);
      setCategory(inferredCategory);
    }
    
    if (
      !lowercaseQuery.includes('near') && 
      !lowercaseQuery.includes('in ') &&
      (lowercaseQuery.includes('cafe') || 
       lowercaseQuery.includes('café') ||
       lowercaseQuery.includes('restaurant') || 
       lowercaseQuery.includes('salon') || 
       lowercaseQuery.includes('plumber') ||
       lowercaseQuery.includes('yoga') ||
       lowercaseQuery.includes('biryani'))
    ) {
      processedQuery = `${processedQuery} near me`;
    }
    
    Object.entries(keywordMap).forEach(([key, synonyms]) => {
      synonyms.forEach(synonym => {
        if (lowercaseQuery.includes(synonym)) {
          processedQuery = processedQuery.replace(new RegExp(synonym, 'g'), key);
        }
      });
    });
    
    console.log(`Original query: "${lowercaseQuery}"`);
    console.log(`Processed query: "${processedQuery}"`);
    console.log(`Inferred category: ${inferredCategory}`);
    
    return { processedQuery, inferredCategory };
  };

  const getYogaResults = (searchQuery: string): Recommendation[] => {
    console.log("Getting specialized yoga/fitness results");
    return yogaAndFitnessMockData.filter(studio => {
      if (searchQuery.includes('beginner') && studio.tags.includes('Beginners')) {
        return true;
      }
      return true;
    });
  };

  const searchEvents = (searchQuery: string): AppEvent[] => {
    const lowercaseQuery = searchQuery.toLowerCase();
    
    if (lowercaseQuery.includes('yoga')) {
      const yogaEvents = sampleEvents.filter(event => 
        event.title.toLowerCase().includes('yoga') || 
        event.description.toLowerCase().includes('yoga')
      );
      
      if (yogaEvents.length > 0) {
        return yogaEvents;
      }
    }
    
    return sampleEvents.filter(event => {
      return (
        event.title.toLowerCase().includes(lowercaseQuery) ||
        event.description.toLowerCase().includes(lowercaseQuery) ||
        event.location.toLowerCase().includes(lowercaseQuery)
      );
    });
  };

  const fetchServiceProviders = async (searchTerm: string, categoryFilter: string) => {
    try {
      let query = supabase
        .from('service_providers')
        .select('*');
      
      if (categoryFilter !== 'all') {
        const dbCategory = categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1);
        query = query.eq('category', dbCategory);
      }
      
      if (searchTerm && searchTerm.trim() !== '') {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tags.cs.{"${searchTerm}"}`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching from Supabase:", error);
        return [];
      }
      
      if (data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          tags: item.tags || [],
          rating: item.rating || 4.5,
          address: item.address,
          distance: "0.5 miles away",
          image: item.image_url || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
          images: item.images || [],
          description: item.description || "",
          phone: item.contact_phone,
          openNow: item.open_now || false,
          hours: "Until 8:00 PM",
          priceLevel: "$$"
        }));
      }
      
      return [];
    } catch (err) {
      console.error("Failed to fetch from Supabase:", err);
      return [];
    }
  };

  const fetchRecommendationsFromSupabase = async (searchQuery: string, categoryFilter: string) => {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tags.cs.{"${searchQuery}"}`)
        .order('rating', { ascending: false });
      
      if (error) {
        console.error("Error fetching recommendations from Supabase:", error);
        return null;
      }
      
      if (data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          tags: item.tags || [],
          rating: item.rating || 4.5,
          address: item.address,
          distance: item.distance || "0.5 miles away",
          image: item.image,
          images: item.images || [item.image],
          description: item.description || "",
          phone: item.phone,
          openNow: item.open_now || false,
          hours: item.hours || "Until 8:00 PM",
          priceLevel: item.price_level || "$$",
          reviewCount: item.review_count || 0
        }));
      }
      
      return [];
    } catch (err) {
      console.error("Failed to fetch recommendations from Supabase:", err);
      return null;
    }
  };

  const fetchEventsFromSupabase = async (searchQuery: string) => {
    try {
      let query = supabase.from('events').select('*');
      
      if (searchQuery && searchQuery.trim() !== '') {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching events from Supabase:", error);
        return null;
      }
      
      if (data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          title: item.title,
          date: item.date,
          time: item.time,
          location: item.location,
          description: item.description,
          image: item.image,
          attendees: item.attendees || 0
        }));
      }
      
      return [];
    } catch (err) {
      console.error("Failed to fetch events from Supabase:", err);
      return null;
    }
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { processedQuery, inferredCategory } = processNaturalLanguageQuery(debouncedQuery);
        
        const effectiveCategory = inferredCategory;
        
        console.log("Effective search category:", effectiveCategory);
        console.log("Searching for:", processedQuery);
        
        const supabaseRecommendations = await fetchRecommendationsFromSupabase(
          processedQuery, 
          effectiveCategory
        );
        
        const supabaseEvents = await fetchEventsFromSupabase(processedQuery);
        
        if (supabaseRecommendations && supabaseRecommendations.length > 0) {
          console.log("Using Supabase recommendations data");
          setRecommendations(supabaseRecommendations);
        } else {
          console.log("No Supabase results, using specialized handlers or mock data");
          
          if (debouncedQuery.toLowerCase().includes('yoga') || effectiveCategory === 'fitness') {
            console.log("Specialized handling for yoga query");
            const yogaResults = getYogaResults(debouncedQuery);
            setRecommendations(yogaResults);
          } else if (debouncedQuery.toLowerCase().includes('restaurant') || debouncedQuery.toLowerCase().includes('food') || effectiveCategory === 'restaurants') {
            console.log("Specialized handling for restaurant query");
            const restaurantResults = mockRecommendations.filter(item => 
              item.category === 'Restaurants'
            );
            
            if (restaurantResults.length > 0) {
              setRecommendations(restaurantResults);
            } else {
              const results = searchRecommendations(processedQuery, effectiveCategory);
              setRecommendations(results);
            }
          } else {
            console.log("Search query:", processedQuery);
            console.log("Normalized query:", processedQuery.toLowerCase());
            console.log("Has location term:", processedQuery.toLowerCase().includes('near') || processedQuery.toLowerCase().includes('in '));
            console.log("Location:", processedQuery.toLowerCase().match(/(near|in) ([a-z\s]+)/i)?.[2] || '');
            console.log("Is near me query:", processedQuery.toLowerCase().includes('near me'));
            
            await new Promise(resolve => setTimeout(resolve, 500));
            const locationResults = searchRecommendations(processedQuery, effectiveCategory);
            setRecommendations(locationResults);
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
          const { data, error } = await supabase
            .from('recommendations')
            .select('*')
            .order('rating', { ascending: false })
            .limit(6);
            
          if (error) {
            console.error("Error fetching default results:", error);
            throw error;
          }
          
          if (data && data.length > 0) {
            const mappedResults = data.map(item => ({
              id: item.id,
              name: item.name,
              category: item.category,
              tags: item.tags || [],
              rating: item.rating || 4.5,
              address: item.address,
              distance: item.distance || "0.5 miles away",
              image: item.image,
              images: item.images || [item.image],
              description: item.description || "",
              phone: item.phone,
              openNow: item.open_now || false,
              hours: item.hours || "Until 8:00 PM",
              priceLevel: item.price_level || "$$",
              reviewCount: item.review_count || 0
            }));
            setRecommendations(mappedResults);
          } else {
            setRecommendations(mockRecommendations.slice(0, 6));
          }
        } catch (err) {
          console.error("Failed to fetch default recommendations:", err);
          setRecommendations(mockRecommendations.slice(0, 6));
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

  const filterRecommendations = (
    recs: Recommendation[],
    filterOptions: FilterOptions
  ): Recommendation[] => {
    const { distanceUnit = 'mi' } = filterOptions;
    
    return recs.filter(rec => {
      if (rec.rating < filterOptions.minRating) {
        return false;
      }

      if (filterOptions.openNowOnly && !rec.openNow) {
        return false;
      }

      if (rec.distance) {
        const distanceValue = parseFloat(rec.distance.split(' ')[0]);
        if (!isNaN(distanceValue)) {
          const adjustedDistance = distanceUnit === 'km' ? distanceValue : distanceValue * 1.60934;
          if (adjustedDistance > filterOptions.maxDistance) {
            return false;
          }
        }
      }

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
