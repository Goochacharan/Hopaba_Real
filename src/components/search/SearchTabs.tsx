import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
}
const SearchTabs: React.FC<SearchTabsProps> = ({
  activeTab,
  setActiveTab,
  recommendations,
  events,
  marketplaceListings,
  handleRSVP
}) => {
  return <Tabs defaultValue="locations" className="w-full mb-0" onValueChange={setActiveTab} value={activeTab}>
      <TabsList className="grid w-full max-w-md grid-cols-3 mb-1 TabsList my-0 py-[8px]">
        <TabsTrigger value="locations" className="font-medium text-xs py-0.5">
          Locations ({recommendations.length})
        </TabsTrigger>
        <TabsTrigger value="events" className="font-medium text-xs py-0.5">
          Events ({events.length})
        </TabsTrigger>
        <TabsTrigger value="marketplace" className="font-medium text-xs py-0.5">
          Marketplace ({marketplaceListings.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="locations" className="pt-0 mt-0">
        {recommendations.length > 0 ? <LocationsList recommendations={recommendations} /> : <NoResultsMessage type="locations" />}
      </TabsContent>
      
      <TabsContent value="events" className="pt-0 mt-0">
        {events.length > 0 ? <EventsList events={events} /> : <NoResultsMessage type="events" />}
      </TabsContent>
      
      <TabsContent value="marketplace" className="pt-0 mt-0">
        {marketplaceListings.length > 0 ? <MarketplaceItemsList listings={marketplaceListings} /> : <NoResultsMessage type="marketplace" />}
      </TabsContent>
    </Tabs>;
};
export default SearchTabs;