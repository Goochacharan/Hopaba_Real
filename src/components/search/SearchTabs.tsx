
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Recommendation } from '@/lib/mockData';
import LocationsList from './LocationsList';
import NoResultsMessage from './NoResultsMessage';

interface SearchTabsProps {
  recommendations: Recommendation[];
}

const SearchTabs: React.FC<SearchTabsProps> = ({
  recommendations
}) => {
  return (
    <Tabs defaultValue="locations" className="w-full">
      <TabsContent value="locations" className="pt-0">
        {recommendations.length > 0 ? (
          <LocationsList recommendations={recommendations} />
        ) : (
          <NoResultsMessage type="locations" />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default SearchTabs;
