
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useSearchEnhancement = () => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  const enhanceSearchQuery = async (rawQuery: string, currentPath: string) => {
    if (currentPath === '/marketplace' || currentPath.startsWith('/marketplace')) {
      console.log("Marketplace search - not enhancing:", rawQuery);
      return rawQuery;
    }
    
    if (!rawQuery.trim()) return rawQuery;
    setIsEnhancing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('enhance-search', {
        body: { query: rawQuery }
      });
      
      if (error) {
        console.error('Error enhancing search:', error);
        return rawQuery;
      }
      
      console.log('AI enhanced search:', data);
      
      if (data.enhanced && data.enhanced !== rawQuery) {
        toast({
          title: "Search enhanced with AI",
          description: `We improved your search to: "${data.enhanced}"`,
          duration: 5000
        });
        return data.enhanced;
      }
      
      return rawQuery;
    } catch (err) {
      console.error('Failed to enhance search:', err);
      return rawQuery;
    } finally {
      setIsEnhancing(false);
    }
  };

  return {
    isEnhancing,
    enhanceSearchQuery
  };
};
