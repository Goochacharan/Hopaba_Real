
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculateDistance } from '@/lib/locationUtils';

export interface Recommendation {
  id: string;
  name: string;
  category: string;
  tags?: string[];
  rating?: number;
  address?: string;
  distance?: string;
  image?: string;
  images?: string[];
  description?: string;
  phone?: string;
  openNow?: boolean;
  hours?: string;
  website?: string;
  instagram?: string;
  price?: string;
  price_level?: string;
  area?: string;
  city?: string;
  availability?: string | string[];
  availability_days?: string[] | string;
  availability_start_time?: string;
  availability_end_time?: string;
  reviewCount?: number;
  isHiddenGem?: boolean;
  isMustVisit?: boolean;
  location?: [number, number];
  mapLink?: string;
  created_at?: string;
  hiddenGemCount?: number;
  mustVisitCount?: number;
  map_link?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  attendees: number;
  pricePerPerson?: number;
  image?: string;
  isHiddenGem?: boolean;
  isMustVisit?: boolean;
  approval_status?: string;
  user_id?: string;
  created_at?: string;
}

interface UseRecommendationsProps {
  selectedLocation?: { lat: number; lng: number } | null;
  category?: string;
  searchTerm?: string;
  sortBy?: string;
  isOpen?: boolean;
  priceLevel?: string;
  limit?: number;
  initialQuery?: string;
  initialCategory?: string;
}

interface FilterOptions {
  maxDistance?: number;
  minRating?: number;
  priceLevel?: string[];
  openNow?: boolean;
  hiddenGem?: boolean;
  mustVisit?: boolean;
  distanceUnit?: string;
}

export const useRecommendations = ({
  selectedLocation,
  category,
  searchTerm,
  sortBy = 'distance',
  isOpen = false,
  priceLevel,
  limit = 50,
  initialQuery,
  initialCategory = 'all'
}: UseRecommendationsProps = {}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businessCount, setBusinessCount] = useState(0);
  const [query, setQuery] = useState(initialQuery || '');
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  // Fetch recommendations based on the provided filters
  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('service_providers')
        .select('*')
        .eq('approval_status', 'approved');

      // Apply category filter if provided
      if (category && category !== 'All') {
        query = query.eq('category', category);
      }

      // Apply search term filter if provided
      if (searchTerm && searchTerm.trim() !== '') {
        const searchLower = searchTerm.toLowerCase();
        query = query.or(`name.ilike.%${searchLower}%,description.ilike.%${searchLower}%,tags.cs.{${searchLower}}`);
      }

      // Apply open now filter if required
      if (isOpen) {
        query = query.eq('open_now', true);
      }

      // Fetch businesses with applied filters
      const { data: businesses, error: fetchError, count } = await query.order('created_at', { ascending: false }).limit(limit);

      if (fetchError) {
        throw fetchError;
      }

      if (count !== null) {
        setBusinessCount(count);
      }

      if (!businesses || businesses.length === 0) {
        setRecommendations([]);
        setLoading(false);
        return;
      }

      // Transform business data to match Recommendation interface
      const transformedData: Recommendation[] = businesses.map((business: any) => {
        // Calculate distance if location is provided
        let distanceText = '';
        if (selectedLocation && business.coordinates) {
          try {
            const coordinatesStr = business.coordinates as string;
            const coordinateMatch = coordinatesStr.match(/\(([^)]+)\)/);
            if (coordinateMatch && coordinateMatch[1]) {
              const coordParts = coordinateMatch[1].split(' ');
              if (coordParts.length === 2) {
                const [lng, lat] = coordParts.map(Number);
                if (!isNaN(lat) && !isNaN(lng)) {
                  const distance = calculateDistance(
                    selectedLocation.lat,
                    selectedLocation.lng,
                    lat,
                    lng
                  );
                  distanceText = distance < 1 
                    ? `${(distance * 1000).toFixed(0)} m` 
                    : `${distance.toFixed(1)} km`;
                }
              }
            }
          } catch (e) {
            console.error('Error parsing coordinates:', e);
          }
        }

        // Prepare availability_days based on the data type
        let availabilityDays: string[] | string = business.availability_days || [];
        if (typeof availabilityDays === 'string' && availabilityDays) {
          try {
            // Try to parse it if it might be a JSON string
            if (availabilityDays.includes('[') && availabilityDays.includes(']')) {
              availabilityDays = JSON.parse(availabilityDays as string);
            }
          } catch (e) {
            console.error('Error parsing availability_days:', e);
          }
        }

        return {
          id: business.id,
          name: business.name,
          category: business.category,
          description: business.description || '',
          address: business.address,
          area: business.area,
          city: business.city,
          tags: business.tags || [],
          rating: business.rating || 4.5,
          reviewCount: business.review_count || 0,
          distance: distanceText || business.distance,
          openNow: business.open_now,
          hours: business.hours,
          price: business.price,
          price_level: business.price_level,
          website: business.website,
          instagram: business.instagram,
          phone: business.contact_phone,
          image: business.image_url || '/placeholder.svg',
          images: business.images || [],
          availability: business.availability,
          availability_days: availabilityDays,
          availability_start_time: business.availability_start_time,
          availability_end_time: business.availability_end_time,
          map_link: business.map_link,
          created_at: business.created_at
        };
      });

      // Apply sorting
      let sortedData = [...transformedData];
      
      if (sortBy === 'distance' && selectedLocation) {
        sortedData = sortedData.sort((a, b) => {
          const distA = a.distance ? parseFloat(a.distance.replace(' km', '').replace(' m', '')) : Infinity;
          const distB = b.distance ? parseFloat(b.distance.replace(' km', '').replace(' m', '')) : Infinity;
          return distA - distB;
        });
      } else if (sortBy === 'rating') {
        sortedData = sortedData.sort((a, b) => ((b.rating || 0) - (a.rating || 0)));
      } else if (sortBy === 'newest') {
        sortedData = sortedData.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
      }

      setRecommendations(sortedData);
      
      // Also fetch events
      try {
        const { data: eventsData } = await supabase
          .from('events')
          .select('*')
          .eq('approval_status', 'approved')
          .order('created_at', { ascending: false });
          
        setEvents(eventsData || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      }
    } catch (err: any) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, category, searchTerm, sortBy, isOpen, priceLevel, limit]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    // Additional search logic can be added here
  };

  const handleCategoryChange = (newCategory: string) => {
    setActiveCategory(newCategory);
    // Additional category change logic can be added here
  };

  const filterRecommendations = (recommendations: Recommendation[], filters: FilterOptions) => {
    return recommendations.filter(recommendation => {
      // Apply distance filter
      if (filters.maxDistance && recommendation.distance) {
        const distanceValue = parseFloat(recommendation.distance.replace(' km', '').replace(' m', ''));
        const unit = recommendation.distance.includes('km') ? 'km' : 'm';
        
        const distanceInKm = unit === 'm' ? distanceValue / 1000 : distanceValue;
        if (distanceInKm > filters.maxDistance) return false;
      }

      // Apply rating filter
      if (filters.minRating && (recommendation.rating || 0) < filters.minRating) return false;

      // Apply open now filter
      if (filters.openNow && !recommendation.openNow) return false;

      // Apply hidden gem filter
      if (filters.hiddenGem && !recommendation.isHiddenGem) return false;

      // Apply must visit filter
      if (filters.mustVisit && !recommendation.isMustVisit) return false;

      return true;
    });
  };

  return { 
    recommendations, 
    events,
    loading, 
    error, 
    refetch: fetchRecommendations,
    totalCount: businessCount,
    query,
    category: activeCategory,
    handleSearch,
    handleCategoryChange,
    filterRecommendations
  };
};
