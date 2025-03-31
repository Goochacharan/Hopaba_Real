
import { useState, useEffect } from 'react';
import { Recommendation } from '@/types/recommendation';
import { supabase } from '@/integrations/supabase/client';

// Helper function to check if a business is currently open
const isOpenNow = (
  availabilityDays?: string[] | string,
  startTime?: string,
  endTime?: string
): boolean => {
  if (!availabilityDays || !startTime || !endTime) return false;

  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Process availability days (it can be string or array)
  let days: string[] = [];
  if (Array.isArray(availabilityDays)) {
    days = availabilityDays;
  } else if (typeof availabilityDays === 'string') {
    days = availabilityDays.split(',').map(day => day.trim());
  }
  
  // Check if today is in the availability days
  if (!days.includes(currentDay)) return false;
  
  // Parse time ranges
  const formatTime = (timeStr: string): Date => {
    const [time, period] = timeStr.split(' ');
    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);
    
    if (period === 'PM' && hour < 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  };
  
  const start = formatTime(startTime);
  const end = formatTime(endTime);
  
  // Return true if current time is between start and end
  return now >= start && now <= end;
};

export const useRecommendations = (query: string, category?: string) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!query.trim()) {
        setRecommendations([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('service_providers')
          .select('*')
          .ilike('name', `%${query}%`)
          .or(`description.ilike.%${query}%, tags.cs.{${query}}`)
          .eq('approval_status', 'approved');
          
        if (error) throw error;
        
        const results = data.map(business => {
          // Convert availability to array
          const availability = Array.isArray(business.availability) 
            ? business.availability 
            : business.availability ? [business.availability] : [];
          
          // Convert availability_days to array if it's a string
          let availability_days;
          if (business.availability_days) {
            availability_days = typeof business.availability_days === 'string'
              ? business.availability_days.split(',').map((day: string) => day.trim())
              : business.availability_days;
          } else {
            availability_days = [];
          }
          
          // Check if business is currently open
          const openNow = isOpenNow(
            business.availability_days,
            business.availability_start_time,
            business.availability_end_time
          );
          
          return {
            id: business.id,
            name: business.name,
            category: business.category,
            tags: business.tags || [],
            rating: business.rating || 4.5,
            address: business.address,
            distance: '2.3 km', // This would be calculated based on user location
            image_url: business.images && business.images.length > 0 ? business.images[0] : undefined,
            images: business.images || [],
            description: business.description,
            contact_phone: business.contact_phone,
            whatsapp: business.whatsapp,
            openNow,
            hours: business.availability_start_time && business.availability_end_time 
              ? `${business.availability_start_time} - ${business.availability_end_time}` 
              : undefined,
            area: business.area,
            city: business.city,
            availability,
            availability_days,
            availability_start_time: business.availability_start_time,
            availability_end_time: business.availability_end_time,
            created_at: business.created_at
          } as Recommendation;
        });
        
        // Filter by category if provided
        const filteredResults = category 
          ? results.filter(item => item.category === category)
          : results;
          
        setRecommendations(filteredResults);
      } catch (err: any) {
        console.error('Error fetching recommendations:', err);
        setError(err.message || 'Failed to fetch recommendations');
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [query, category]);
  
  return { recommendations, loading, error };
};
