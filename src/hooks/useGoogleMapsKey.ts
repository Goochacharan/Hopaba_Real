
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
      
      console.log('Fetching Google Maps API key...');
      const { data, error } = await supabase.functions.invoke('get-google-maps-key');
      
      if (error) {
        console.error('Error fetching Google Maps API key:', error);
        setError('Failed to get map API key: ' + error.message);
        toast({
          title: "Error loading map",
          description: "Failed to fetch map API key. Please try again.",
          variant: "destructive",
        });
        return null;
      }
      
      if (!data?.apiKey) {
        console.error('No API key found in response');
        setError('API key not found in response');
        toast({
          title: "Map error",
          description: "Map API key not available. Please check configuration.",
          variant: "destructive",
        });
        return null;
      }
      
      console.log('Successfully retrieved Google Maps API key');
      return data.apiKey;
    } catch (err) {
      console.error('Exception fetching Google Maps API key:', err);
      setError('Failed to get map API key');
      toast({
        title: "Error loading map",
        description: "An unexpected error occurred while fetching the map API key.",
        variant: "destructive",
      });
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
