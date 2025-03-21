
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, MessageCircle, AlertCircle } from 'lucide-react';
import { useSellerDetails } from '@/hooks/useSellerDetails';
import SellerProfileCard from '@/components/marketplace/SellerProfileCard';
import SellerReviews from '@/components/marketplace/SellerReviews';
import MarketplaceListingCard from '@/components/MarketplaceListingCard';

const SellerDetails = () => {
  const { id } = useParams<{ id: string; }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sellerDetails, loading, error } = useSellerDetails(id || '');

  const handleAddReview = async (review: { rating: number; comment: string; }) => {
    // Mock implementation with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: 'Review submitted',
      description: 'Thank you for your feedback!'
    });
  };

  const handleReport = () => {
    toast({
      title: 'Report submitted',
      description: 'We will review this seller and take appropriate action.'
    });
  };

  return (
    <MainLayout>
      <div className="w-full max-w-full mx-auto px-4 py-8 overflow-y-auto pb-32">
        <div className="max-w-[1400px] mx-auto">
          <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>

          {loading ? (
            <div className="text-center py-16">
              <p className="text-lg">Loading seller details...</p>
            </div>
          ) : error ? (
            <Card className="p-12 text-center my-8">
              <AlertCircle className="h-16 w-16 mx-auto text-destructive" />
              <h3 className="mt-6 text-2xl font-semibold">Error Loading Seller</h3>
              <p className="mt-4 text-lg text-muted-foreground">{error}</p>
              <Button className="mt-8 px-8 py-6 text-lg" onClick={() => navigate('/marketplace')}>
                Return to Marketplace
              </Button>
            </Card>
          ) : sellerDetails ? (
            <>
              <div className="w-full gap-8 mb-12">
                <SellerProfileCard 
                  sellerName={sellerDetails.name} 
                  sellerRating={sellerDetails.rating} 
                  reviewCount={sellerDetails.review_count} 
                  joinedDate={sellerDetails.listings[0]?.created_at} 
                />

                <Card className="p-8 shadow-md w-full mt-8">
                  <h3 className="font-medium text-xl mb-6">Contact Options</h3>
                  <div className="flex flex-col md:flex-row gap-6">
                    <Button className="w-full py-6 text-lg" size="lg">
                      <MessageCircle className="h-6 w-6 mr-3" />
                      Message Seller
                    </Button>
                    <Button variant="outline" className="w-full py-6 text-lg" size="lg" onClick={handleReport}>
                      <AlertCircle className="h-6 w-6 mr-3" />
                      Report Seller
                    </Button>
                  </div>
                </Card>
              </div>

              <Tabs defaultValue="listings" className="w-full mb-20">
                <TabsList className="w-full bg-background border-b mb-8">
                  <TabsTrigger value="listings" className="text-lg px-8 py-4 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                    Listings ({sellerDetails.listings.length})
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="text-lg px-8 py-4 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                    Reviews ({sellerDetails.reviews.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="listings" className="w-full">
                  {sellerDetails.listings.length > 0 ? (
                    <div className="w-full space-y-8">
                      {sellerDetails.listings.map(listing => (
                        <MarketplaceListingCard key={listing.id} listing={listing} className="w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <p className="text-xl text-muted-foreground">This seller has no active listings.</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="reviews" className="w-full">
                  <SellerReviews 
                    sellerId={sellerDetails.id} 
                    sellerName={sellerDetails.name} 
                    reviews={sellerDetails.reviews} 
                    onAddReview={handleAddReview} 
                  />
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">Seller not found.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SellerDetails;
