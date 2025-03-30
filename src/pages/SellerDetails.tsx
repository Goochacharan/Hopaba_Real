
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { useSellerDetails } from '@/hooks/useSellerDetails';
import SellerProfileCard from '@/components/marketplace/SellerProfileCard';
import SellerReviews from '@/components/marketplace/SellerReviews';
import MarketplaceListingCard from '@/components/MarketplaceListingCard';
import { useAuth } from '@/hooks/useAuth';

const SellerDetails = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const { user } = useAuth();
  const {
    sellerDetails,
    loading,
    error
  } = useSellerDetails(id || '');

  const handleAddReview = async (review: {
    rating: number;
    comment: string;
  }) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to write a review",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    // Mock implementation with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: 'Review submitted',
      description: 'Thank you for your feedback!'
    });
  };

  return <MainLayout>
      <div className="w-full max-w-full mx-auto px-4 py-6">
        <div className="max-w-[1400px] mx-0 px-[2px] py-0 my-0">
          <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>

          {loading ? <div className="text-center py-12">
              <p className="text-lg">Loading seller details...</p>
            </div> : error ? <Card className="p-10 text-center my-6">
              <AlertCircle className="h-14 w-14 mx-auto text-destructive" />
              <h3 className="mt-4 text-xl font-semibold">Error Loading Seller</h3>
              <p className="mt-3 text-lg text-muted-foreground">{error}</p>
              <Button className="mt-6 px-6 py-5 text-lg" onClick={() => navigate('/marketplace')}>
                Return to Marketplace
              </Button>
            </Card> : sellerDetails ? <>
              <div className="w-full gap-6 mb-8">
                <SellerProfileCard 
                  sellerName={sellerDetails.name} 
                  sellerRating={sellerDetails.rating} 
                  reviewCount={sellerDetails.review_count} 
                  joinedDate={sellerDetails.listings[0]?.created_at}
                  sellerPhone={sellerDetails.listings[0]?.seller_phone}
                  sellerWhatsapp={sellerDetails.listings[0]?.seller_whatsapp}
                  location={sellerDetails.listings[0]?.location}
                  mapLink={sellerDetails.listings[0]?.map_link}
                  listingId={id}
                />
              </div>

              <Tabs defaultValue="listings" className="w-full">
                <TabsList className="w-full bg-background border-b mb-6">
                  <TabsTrigger value="listings" className="text-base px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                    Listings ({sellerDetails.listings.length})
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="text-base px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                    Reviews ({sellerDetails.reviews.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="listings" className="w-full">
                  {sellerDetails.listings.length > 0 ? <div className="w-full space-y-6">
                      {sellerDetails.listings.map(listing => <MarketplaceListingCard key={listing.id} listing={listing} className="w-full" />)}
                    </div> : <div className="text-center py-12">
                      <p className="text-lg text-muted-foreground">This seller has no active listings.</p>
                    </div>}
                </TabsContent>
                
                <TabsContent value="reviews" className="w-full">
                  <SellerReviews sellerId={sellerDetails.id} sellerName={sellerDetails.name} reviews={sellerDetails.reviews} onAddReview={handleAddReview} />
                </TabsContent>
              </Tabs>
            </> : <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">Seller not found.</p>
            </div>}
        </div>
      </div>
    </MainLayout>;
};
export default SellerDetails;
