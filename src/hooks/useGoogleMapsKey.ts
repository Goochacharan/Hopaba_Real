
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGoogleMapsKey = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchApiKey = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.functions.invoke('get-google-maps-key');
      
      if (error) {
        console.error('Error fetching Google Maps API key:', error);
        setError('Failed to get map API key: ' + error.message);
        return null;
      }
      
      if (!data?.apiKey) {
        setError('API key not found');
        return null;
      }
      
      return data.apiKey;
    } catch (err) {
      console.error('Exception fetching Google Maps API key:', err);
      setError('Failed to get map API key');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchApiKey,
    loading,
    error,
  };
};
