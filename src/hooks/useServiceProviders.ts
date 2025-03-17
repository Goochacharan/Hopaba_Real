
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ServiceProvider } from '@/types/serviceProvider';
import { mockRecommendations } from '@/lib/mockData';

export const fetchServiceProviders = async (): Promise<ServiceProvider[]> => {
  try {
    const { data, error } = await supabase
      .from('service_providers')
      .select('*');

    if (error) {
      console.error('Error fetching service providers:', error);
      // Fall back to mock data if there's an error
      return mockRecommendations as unknown as ServiceProvider[];
    }

    return data as ServiceProvider[];
  } catch (error) {
    console.error('Exception fetching service providers:', error);
    // Fall back to mock data if there's an exception
    return mockRecommendations as unknown as ServiceProvider[];
  }
};

export const useServiceProviders = () => {
  return useQuery({
    queryKey: ['serviceProviders'],
    queryFn: fetchServiceProviders,
  });
};
