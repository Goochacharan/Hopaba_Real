
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingMarketplaceListings from "./PendingMarketplaceListings";
import PendingServiceProviders from "./PendingServiceProviders";
import PendingEvents from "./PendingEvents";
import SellerLimitsSection from "./SellerLimitsSection";

export function AdminPanelTabs() {
  return (
    <Tabs defaultValue="marketplace" className="w-full">
      <TabsList>
        <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        <TabsTrigger value="services">Services</TabsTrigger>
        <TabsTrigger value="events">Events</TabsTrigger>
        <TabsTrigger value="seller-limits">Seller Limits</TabsTrigger>
      </TabsList>
      <TabsContent value="marketplace">
        <PendingMarketplaceListings />
      </TabsContent>
      <TabsContent value="services">
        <PendingServiceProviders />
      </TabsContent>
      <TabsContent value="events">
        <PendingEvents />
      </TabsContent>
      <TabsContent value="seller-limits">
        <SellerLimitsSection />
      </TabsContent>
    </Tabs>
  );
}
