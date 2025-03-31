
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
  area?: string;
  city?: string;
  availability?: string | string[];
  availability_days?: string[] | string;
  availability_start_time?: string;
  availability_end_time?: string;
  reviewCount?: number;
  location?: [number, number];
  mapLink?: string;
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
}

export const useRecommendations = ({
  selectedLocation,
  category,
  searchTerm,
  sortBy = 'distance',
  isOpen = false,
  priceLevel,
  limit = 50
}: UseRecommendationsProps = {}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businessCount, setBusinessCount] = useState(0);

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
      let transformedData: Recommendation[] = businesses.map(business => {
        // Calculate distance if location is provided
        let distanceText = '';
        if (selectedLocation && business.coordinates) {
          const [lng, lat] = business.coordinates.split('(')[1].split(')')[0].split(' ').map(Number);
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

        // Prepare availability_days based on the data type
        let availabilityDays = business.availability_days;
        if (typeof availabilityDays === 'string' && availabilityDays) {
          try {
            // Try to parse it if it might be a JSON string
            if (availabilityDays.startsWith('[') && availabilityDays.endsWith(']')) {
              availabilityDays = JSON.parse(availabilityDays);
            }
          } catch (e) {
            console.error('Error parsing availability_days:', e);
          }
        }

        return {
          id: business.id,
          name: business.name,
          category: business.category,
          description: business.description,
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
          website: business.website,
          instagram: business.instagram,
          phone: business.contact_phone,
          image: business.image_url || '/placeholder.svg',
          images: business.images || [],
          availability: business.availability,
          availability_days: availabilityDays,
          availability_start_time: business.availability_start_time,
          availability_end_time: business.availability_end_time,
          mapLink: business.map_link,
          created_at: business.created_at
        };
      });

      // Apply sorting
      if (sortBy === 'distance' && selectedLocation) {
        transformedData = transformedData.sort((a, b) => {
          const distA = a.distance ? parseFloat(a.distance.replace(' km', '').replace(' m', '')) : Infinity;
          const distB = b.distance ? parseFloat(b.distance.replace(' km', '').replace(' m', '')) : Infinity;
          return distA - distB;
        });
      } else if (sortBy === 'rating') {
        transformedData = transformedData.sort((a, b) => ((b.rating || 0) - (a.rating || 0)));
      } else if (sortBy === 'newest') {
        transformedData = transformedData.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
      }

      setRecommendations(transformedData);
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

  return { 
    recommendations, 
    loading, 
    error, 
    refetch: fetchRecommendations,
    totalCount: businessCount
  };
};
