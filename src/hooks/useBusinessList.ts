
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Recommendation } from '@/types/recommendation';

export const useBusinessList = (userId: string | undefined, refresh: boolean = false) => {
  const [businesses, setBusinesses] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchBusinesses = async () => {
      if (!userId) {
        setBusinesses([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('service_providers')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        const formattedData = data.map(item => {
          // Convert availability to array
          const availability = Array.isArray(item.availability) 
            ? item.availability 
            : item.availability ? [item.availability] : [];
          
          // Convert availability_days to array if it's a string
          let availability_days;
          if (item.availability_days) {
            availability_days = typeof item.availability_days === 'string'
              ? item.availability_days.split(',').map((day: string) => day.trim())
              : item.availability_days;
          } else {
            availability_days = [];
          }
          
          return {
            ...item,
            availability,
            availability_days
          } as Recommendation;
        });
        
        setBusinesses(formattedData);
      } catch (error: any) {
        console.error('Error fetching businesses:', error);
        setError(error.message || 'Failed to fetch businesses');
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBusinesses();
  }, [userId, refresh]);
  
  return { businesses, loading, error };
};
