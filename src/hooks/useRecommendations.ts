import { useState, useEffect } from 'react';
import { Recommendation, mockRecommendations, searchRecommendations } from '@/lib/mockData';
import { CategoryType } from '@/components/CategoryFilter';
import { supabase } from '@/integrations/supabase/client';

interface UseRecommendationsProps {
  initialQuery?: string;
  initialCategory?: CategoryType;
}

interface FilterOptions {
  maxDistance: number;
  minRating: number;
  priceLevel: number;
  openNow: boolean;
  hiddenGem?: boolean;
  mustVisit?: boolean;
  distanceUnit?: 'km' | 'mi';
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  attendees: number;
  pricePerPerson?: number;
  phoneNumber?: string;
  whatsappNumber?: string;
  images?: string[];
}

const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Summer Food Festival',
    date: 'July 15, 2023',
    time: '11:00 AM - 8:00 PM',
    location: 'Central Park, San Francisco',
    description: 'A culinary celebration featuring over 30 local restaurants, live cooking demonstrations, and music performances.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    attendees: 215
  },
  {
    id: '2',
    title: 'Weekend Art Exhibition',
    date: 'July 22-23, 2023',
    time: '10:00 AM - 6:00 PM',
    location: 'Modern Art Gallery, Indiranagar',
    description: 'Showcasing works from emerging local artists with interactive sessions and workshops throughout the weekend.',
    image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    attendees: 98
  },
  {
    id: '3',
    title: 'Wellness & Yoga Retreat',
    date: 'August 5, 2023',
    time: '7:00 AM - 4:00 PM',
    location: 'Sunset Beach, Koramangala',
    description: 'A day-long retreat with yoga sessions, meditation workshops, and healthy living seminars led by certified instructors.',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    attendees: 42
  },
  {
    id: '4',
    title: 'Tech Startup Networking',
    date: 'August 12, 2023',
    time: '6:00 PM - 9:00 PM',
    location: 'Innovation Hub, Whitefield',
    description: 'Connect with founders, investors, and tech enthusiasts in a casual setting with keynote speakers and pitch opportunities.',
    image: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1728&q=80',
    attendees: 127
  },
  {
    id: '5',
    title: 'Yoga for Beginners Workshop',
    date: 'August 20, 2023',
    time: '9:00 AM - 12:00 PM',
    location: 'Serenity Yoga Studio, Indiranagar',
    description: 'A beginner-friendly workshop introducing fundamental yoga poses, breathing techniques, and mindfulness practices for newcomers.',
    image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    attendees: 32
  }
];

const yogaAndFitnessMockData: Recommendation[] = [
  {
    id: '101',
    name: 'Serenity Yoga Studio',
    category: 'Fitness',
    tags: ['Yoga', 'Beginners', 'Meditation'],
    rating: 4.8,
    address: '123 Zen Street, Indiranagar, Bangalore',
    distance: '0.6 miles away',
    phone: '+919876543230',
    image: 'https://images.unsplash.com/photo-1570655652364-2e0a67455ac6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    description: 'Peaceful yoga studio offering classes for all levels with focus on proper alignment and mindful practice.',
    openNow: true,
    hours: 'Until 9:00 PM',
    priceLevel: '$$',
    images: [
      'https://images.unsplash.com/photo-1570655652364-2e0a67455ac6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1599447421416-3414500d18a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1220&q=80'
    ]
  },
  {
    id: '102',
    name: 'Namaste Yoga Center',
    category: 'Fitness',
    tags: ['Yoga', 'Hatha', 'Vinyasa'],
    rating: 4.7,
    address: '456 Harmony Road, Koramangala, Bangalore',
    distance: '1.2 miles away',
    phone: '+919876543231',
    image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    description: 'Traditional yoga center offering Hatha and Vinyasa classes with experienced instructors in a calming environment.',
    openNow: true,
    hours: 'Until 8:30 PM',
    priceLevel: '$$',
    images: [
      'https://images.unsplash.com/photo-1588286840104-8957b019727f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1573126617899-41f1dffb196c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    ]
  },
  {
    id: '103',
    name: 'Flow Yoga & Wellness',
    category: 'Fitness',
    tags: ['Yoga', 'Beginners', 'Workshops'],
    rating: 4.9,
    address: '789 Peaceful Lane, Jayanagar, Bangalore',
    distance: '0.8 miles away',
    phone: '+919876543232',
    image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    description: 'Wellness-focused yoga studio with special workshops for beginners and programs for stress relief and flexibility.',
    openNow: false,
    hours: 'Opens tomorrow at 6:00 AM',
    priceLevel: '$$$',
    images: [
      'https://images.unsplash.com/photo-1599447421416-3414500d18a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    ]
  }
];

const searchPatterns = [
  { pattern: /cafe|coffee/i, category: 'cafes' },
  { pattern: /restaurant|food|eat|dining|biryani|dinner|lunch|breakfast/i, category: 'restaurants' },
  { pattern: /salon|haircut|barber|beauty|spa/i, category: 'salons' },
  { pattern: /plumber|plumbing|pipe|leak|tap/i, category: 'services' },
  { pattern: /doctor|clinic|hospital|health/i, category: 'health' },
  { pattern: /shop|store|mall|buy/i, category: 'shopping' },
  { pattern: /school|college|class|teacher|tutor/i, category: 'education' },
  { pattern: /yoga|fitness|gym|workout|exercise/i, category: 'fitness' },
  { pattern: /dentist|dental/i, category: 'health' },
  { pattern: /piano|music|instrument/i, category: 'education' },
  { pattern: /tailor|alter|clothing|wear/i, category: 'services' },
  { pattern: /photographer|photo|wedding/i, category: 'services' },
  { pattern: /computer|repair|laptop|tech/i, category: 'services' },
];

const keywordMap = {
  'near me': ['nearby', 'close', 'close by', 'around me', 'in my area', 'local'],
  'indiranagar': ['indiranagar', 'indira nagar', 'indranagar'],
  'koramangala': ['koramangala', 'kormangala'],
  'malleshwaram': ['malleshwaram', 'malleswaram', 'malleshwar'],
  'nagarbhavi': ['nagarbhavi', 'nagar bhavi', 'nagarbavi'],
  'jayanagar': ['jayanagar', 'jaya nagar', 'jaynagar'],
  
  'restaurant': ['restaurant', 'dining', 'place to eat', 'eatery', 'food place', 'dinner', 'biryani'],
  'cafe': ['cafe', 'coffee shop', 'coffee place', 'coffee house', 'bakery'],
  'salon': ['salon', 'saloon', 'haircut', 'hair stylist', 'spa', 'beauty parlor', 'barber'],
  'school': ['school', 'academy', 'class', 'teacher', 'tutor', 'instructor', 'lessons'],
  'plumber': ['plumber', 'plumbing', 'pipe repair', 'water leak', 'tap repair'],
  
  'good': ['good', 'best', 'top', 'great', 'excellent', 'amazing', 'fantastic', 'quality'],
  'cheap': ['cheap', 'affordable', 'budget', 'inexpensive', 'reasonable', 'economical'],
  'expensive': ['expensive', 'high-end', 'luxury', 'premium', 'upscale'],
  'open': ['open', 'available', 'open now', 'available now', 'right now', 'currently'],
  'veg': ['veg', 'vegetarian', 'pure veg'],
  'non-veg': ['non-veg', 'non vegetarian', 'nonveg', 'meat', 'chicken', 'beef', 'pork'],
  'hidden gem': ['hidden gem', 'underrated', 'secret', 'unknown', 'not popular', 'undiscovered'],
  'popular': ['popular', 'crowded', 'well known', 'famous', 'trending', 'busy']
};

const useRecommendations = ({ 
  initialQuery = '', 
  initialCategory = 'all' 
}: UseRecommendationsProps = {}) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<CategoryType>(initialCategory);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
    }).map(result => ({
      ...result,
      created_at: result.created_at || new Date().toISOString() // Ensure created_at exists for sorting
    }));
  };

  const searchEvents = (searchQuery: string): Event[] => {
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
          availability: item.availability || null,
          priceLevel: "$$",
          price_range_min: item.price_range_min || null,
          price_range_max: item.price_range_max || null,
          price_unit: item.price_unit || null,
          map_link: item.map_link || null,
          instagram: item.instagram || '',
          availability_days: item.availability_days || [],
          availability_start_time: item.availability_start_time || '',
          availability_end_time: item.availability_end_time || '',
          created_at: item.created_at || new Date().toISOString()
        }));
      }
      
      return [];
    } catch (err) {
      console.error("Failed to fetch from Supabase:", err);
      return [];
    }
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

      if (filterOptions.openNow && !rec.openNow) {
        return false;
      }

      if (filterOptions.hiddenGem && !rec.isHiddenGem) {
        return false;
      }

      if (filterOptions.mustVisit && !rec.isMustVisit) {
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

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { processedQuery, inferredCategory } = processNaturalLanguageQuery(query);
        
        const effectiveCategory = inferredCategory;
        
        console.log("Effective search category:", effectiveCategory);
        
        if (query.toLowerCase().includes('yoga') || effectiveCategory === 'fitness') {
          console.log("Specialized handling for yoga query");
          const yogaResults = getYogaResults(query);
          setRecommendations(yogaResults);
          
          const matchingEvents = searchEvents(processedQuery);
          setEvents(matchingEvents);
          setLoading(false);
          return;
        }
        
        if (query.toLowerCase().includes('restaurant') || effectiveCategory === 'restaurants') {
          console.log("Specialized handling for restaurant query");
          const restaurantResults = mockRecommendations.filter(item => 
            item.category === 'Restaurants'
          ).map(result => ({
            ...result,
            created_at: result.created_at || new Date().toISOString() // Ensure created_at exists for sorting
          }));
          
          if (restaurantResults.length > 0) {
            setRecommendations(restaurantResults);
            const matchingEvents = searchEvents(processedQuery);
            setEvents(matchingEvents);
            setLoading(false);
            return;
          }
        }
        
        const supabaseResults = await fetchServiceProviders(query, effectiveCategory);
        
        if (supabaseResults && supabaseResults.length > 0) {
          console.log("Using Supabase results:", supabaseResults.length);
          setRecommendations(supabaseResults.map(result => ({
            ...result,
            created_at: result.created_at || new Date().toISOString() // Ensure created_at exists for sorting
          })));
        } else {
          console.log("No Supabase results, using mock data");
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const locationResults = searchRecommendations(processedQuery, effectiveCategory);
          
          const resultsWithImages = locationResults.map(result => {
            if (result.images && result.images.length > 0) {
              return {
                ...result,
                created_at: result.created_at || new Date().toISOString() // Ensure created_at exists for sorting
              };
            }
            
            const mainImage = result.image;
            const baseUrl = mainImage.split('?')[0];
            const images = [
              mainImage,
              `${baseUrl}?v=2`,
              `${baseUrl}?v=3`,
            ];
            
            return {
              ...result,
              images,
              created_at: result.created_at || new Date().toISOString() // Ensure created_at exists for sorting
            };
          });
          
          setRecommendations(resultsWithImages);
        }
        
        const matchingEvents = searchEvents(processedQuery);
        setEvents(matchingEvents);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to fetch recommendations. Please try again.');
        setRecommendations([]);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchRecommendations();
    } else {
      const defaultResults = mockRecommendations.slice(0, 6).map(result => ({
        ...result,
        created_at: result.created_at || new Date().toISOString() // Ensure created_at exists for sorting
      }));
      setRecommendations(defaultResults);
      setEvents([]);
      setLoading(false);
    }
  }, [query, category]);

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
