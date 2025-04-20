
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PendingMarketplaceListings } from "./PendingMarketplaceListings";
import { PendingServiceProviders } from "./PendingServiceProviders";
import { PendingEvents } from "./PendingEvents";
import SellerLimitsSection from "./SellerLimitsSection";
import { usePendingListings } from "@/hooks/usePendingListings";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";

export function AdminPanelTabs() {
  const { 
    pendingListings, 
    loading, 
    error, 
    updateApprovalStatus,
    refreshListings
  } = usePendingListings();

  return (
    <div className="space-y-8">
      {/* Approval Sections */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Pending Approvals</h2>
        <Card className="p-6">
          <Tabs defaultValue="marketplace">
            <TabsList>
              <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
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
          </Tabs>
        </Card>
      </div>

      <Separator />

      {/* Seller Limits Section - Now in its own Card container */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Seller Management</h2>
        <Card className="p-6">
          <SellerLimitsSection />
        </Card>
      </div>
    </div>
  );
}
