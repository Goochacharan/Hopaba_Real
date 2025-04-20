
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PendingMarketplaceListings } from "./PendingMarketplaceListings";
import { PendingServiceProviders } from "./PendingServiceProviders";
import { PendingEvents } from "./PendingEvents";
import SellerLimitsSection from "./SellerLimitsSection";
import { usePendingListings } from "@/hooks/usePendingListings";

export function AdminPanelTabs() {
  const { 
    pendingListings, 
    loading, 
    error, 
    updateApprovalStatus,
    refreshListings
  } = usePendingListings();

  return (
    <Tabs defaultValue="marketplace" className="w-full">
      <TabsList>
        <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        <TabsTrigger value="services">Services</TabsTrigger>
        <TabsTrigger value="events">Events</TabsTrigger>
        <TabsTrigger value="seller-limits">Seller Limits</TabsTrigger>
      </TabsList>
      <TabsContent value="marketplace">
        <PendingMarketplaceListings 
          listings={pendingListings.marketplace}
          loading={loading}
          error={error}
          onApprove={(id) => updateApprovalStatus('marketplace', id, 'approved')}
          onReject={(id) => updateApprovalStatus('marketplace', id, 'rejected')}
          onRefresh={refreshListings}
        />
      </TabsContent>
      <TabsContent value="services">
        <PendingServiceProviders 
          services={pendingListings.services}
          loading={loading}
          error={error}
          onApprove={(id) => updateApprovalStatus('services', id, 'approved')}
          onReject={(id) => updateApprovalStatus('services', id, 'rejected')}
          onRefresh={refreshListings}
        />
      </TabsContent>
      <TabsContent value="events">
        <PendingEvents 
          events={pendingListings.events}
          loading={loading}
          error={error}
          onApprove={(id) => updateApprovalStatus('events', id, 'approved')}
          onReject={(id) => updateApprovalStatus('events', id, 'rejected')}
          onRefresh={refreshListings}
        />
      </TabsContent>
      <TabsContent value="seller-limits">
        <SellerLimitsSection />
      </TabsContent>
    </Tabs>
  );
}
