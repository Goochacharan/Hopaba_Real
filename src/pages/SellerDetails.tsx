
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sellerDetails, loading, error } = useSellerDetails(id || '');

  const handleAddReview = async (review: { rating: number; comment: string }) => {
    // This would normally send the review to the backend
    // For now, we'll just mock it with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Show success message
    toast({
      title: 'Review submitted',
      description: 'Thank you for your feedback!',
    });
  };

  const handleReport = () => {
    toast({
      title: 'Report submitted',
      description: 'We will review this seller and take appropriate action.',
    });
  };

  return (
    <MainLayout>
      <div className="container max-w-6xl py-8">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-8"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {loading ? (
          <div className="text-center py-12">
            <p>Loading seller details...</p>
          </div>
        ) : error ? (
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
            <h3 className="mt-4 text-xl font-semibold">Error Loading Seller</h3>
            <p className="mt-2 text-muted-foreground">{error}</p>
            <Button className="mt-6" onClick={() => navigate('/marketplace')}>
              Return to Marketplace
            </Button>
          </Card>
        ) : sellerDetails ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
              <div className="lg:col-span-3">
                <SellerProfileCard 
                  sellerName={sellerDetails.name}
                  sellerRating={sellerDetails.rating}
                  reviewCount={sellerDetails.review_count}
                  joinedDate={sellerDetails.listings[0]?.created_at}
                />
              </div>
              <div className="flex flex-col gap-4">
                <Card className="p-6 shadow-md">
                  <h3 className="font-medium text-lg mb-4">Contact Seller</h3>
                  <Button className="w-full mb-3" size="lg">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" className="w-full" size="lg" onClick={handleReport}>
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Report Seller
                  </Button>
                </Card>
              </div>
            </div>

            <Tabs defaultValue="listings" className="w-full">
              <TabsList className="mb-8 w-full justify-start border-b">
                <TabsTrigger value="listings" className="text-base px-6 py-3">Listings ({sellerDetails.listings.length})</TabsTrigger>
                <TabsTrigger value="reviews" className="text-base px-6 py-3">Reviews ({sellerDetails.reviews.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="listings">
                {sellerDetails.listings.length > 0 ? (
                  <div className="grid grid-cols-1 gap-8">
                    {sellerDetails.listings.map((listing) => (
                      <MarketplaceListingCard key={listing.id} listing={listing} className="w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">This seller has no active listings.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="reviews">
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
          <div className="text-center py-12">
            <p className="text-muted-foreground">Seller not found.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SellerDetails;
