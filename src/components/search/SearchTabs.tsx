
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Event } from '@/hooks/useRecommendations';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import { Recommendation } from '@/lib/mockData';
import { useLocation } from 'react-router-dom';

import LocationsList from './LocationsList';
import NoResultsMessage from './NoResultsMessage';

interface SearchTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  recommendations: Recommendation[];
  events: Event[];
  marketplaceListings: MarketplaceListing[];
  handleRSVP: (eventTitle: string) => void;
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

