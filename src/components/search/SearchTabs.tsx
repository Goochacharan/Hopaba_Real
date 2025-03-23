
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag } from 'lucide-react';
import { Event } from '@/hooks/useRecommendations';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import { Recommendation } from '@/lib/mockData';

import LocationsList from './LocationsList';
import EventsList from './EventsList';
import MarketplaceItemsList from './MarketplaceItemsList';
import NoResultsMessage from './NoResultsMessage';

interface SearchTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  recommendations: Recommendation[];
  events: Event[];
  marketplaceListings: MarketplaceListing[];
  handleRSVP: (eventTitle: string) => void;
  handleNewSearch: (newQuery: string) => void;
}

const SearchTabs: React.FC<SearchTabsProps> = ({
  activeTab,
  setActiveTab,
  recommendations,
  events,
  marketplaceListings,
  handleRSVP,
  handleNewSearch
}) => {
  return (
    <Tabs defaultValue="locations" className="w-full mb-6" onValueChange={setActiveTab} value={activeTab}>
      <TabsList className="grid w-full max-w-md grid-cols-3 mb-4">
        <TabsTrigger value="locations" className="font-medium">
          Locations ({recommendations.length})
        </TabsTrigger>
        <TabsTrigger value="events" className="font-medium">
          Events ({events.length})
        </TabsTrigger>
        <TabsTrigger value="marketplace" className="font-medium">
          Marketplace ({marketplaceListings.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="locations">
        {recommendations.length > 0 ? (
          <LocationsList recommendations={recommendations} />
        ) : (
          <NoResultsMessage type="locations" onNewSearch={handleNewSearch} />
        )}
      </TabsContent>
      
      <TabsContent value="events">
        {events.length > 0 ? (
          <EventsList events={events} onRSVP={handleRSVP} />
        ) : (
          <NoResultsMessage type="events" />
        )}
      </TabsContent>
      
      <TabsContent value="marketplace">
        {marketplaceListings.length > 0 ? (
          <MarketplaceItemsList listings={marketplaceListings} />
        ) : (
          <NoResultsMessage type="marketplace" />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default SearchTabs;
