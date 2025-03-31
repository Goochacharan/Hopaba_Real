import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { useMarketplaceListing } from '@/hooks/useMarketplaceListings';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ListingImageCarousel from '@/components/marketplace/ListingImageCarousel';
import ListingThumbnails from '@/components/marketplace/ListingThumbnails';
import ListingDescription from '@/components/marketplace/ListingDescription';
import ListingMetadata from '@/components/marketplace/ListingMetadata';
import ImageViewer from '@/components/ImageViewer';
import SafeTradingTips from '@/components/marketplace/SafeTradingTips';
import SellerDetailsCard from '@/components/marketplace/SellerDetailsCard';

const MarketplaceListingDetails = () => {
  const {
    id = ''
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    listing,
    loading,
    error,
    reviews
  } = useMarketplaceListing(id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  
  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };
  
  const handleBackToMarketplace = () => {
    if (listing) {
      navigate(`/marketplace?highlight=${id}&category=${listing.category}`);
    } else {
      navigate('/marketplace');
    }
  };
  
  if (loading) {
    return <MainLayout>
        <div className="container mx-auto py-8 px-4 max-w-6xl animate-pulse">
          <div className="mb-8 h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 gap-8">
            <div>
              <div className="h-[450px] bg-gray-200 rounded-xl mb-4"></div>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
              </div>
            </div>
          </div>
        </div>
      </MainLayout>;
  }
  
  if (error || !listing) {
    return <MainLayout>
        <div className="container mx-auto py-8 px-4 max-w-6xl">
          <Button 
            onClick={handleBackToMarketplace}
            variant="ghost" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Marketplace</span>
          </Button>
          
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || "Failed to load listing details"}</AlertDescription>
          </Alert>
          
          <Button asChild>
            <Link to="/marketplace">Browse other listings</Link>
          </Button>
        </div>
      </MainLayout>;
  }
  
  return <MainLayout>
      <div className="w-full py-8 overflow-y-auto pb-32 px-[11px]">
        <div className="max-w-[1400px] mx-auto">
          <Button 
            onClick={handleBackToMarketplace}
            variant="ghost" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 px-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Marketplace</span>
          </Button>
          
          <div className="grid grid-cols-1 gap-8">
            <div>
              <div className="mb-3">
                <Badge className="mb-2">{listing?.category}</Badge>
                <h1 className="text-2xl sm:text-3xl font-bold mb-0">{listing?.title}</h1>
                <ListingMetadata location={listing?.location || ''} createdAt={listing?.created_at || ''} condition={listing?.condition || ''} />
              </div>
              
              <div className="mb-6 bg-black/5 rounded-xl shadow-sm overflow-hidden">
                <ListingImageCarousel images={listing.images} onImageClick={openImageViewer} listing={listing} />
                
                <div className="p-4">
                  <ListingThumbnails images={listing.images} selectedIndex={selectedImageIndex} onSelect={index => {
                  setSelectedImageIndex(index);
                  openImageViewer(index);
                }} />
                </div>
              </div>
              
              {listing && <ImageViewer 
                images={listing.images} 
                initialIndex={selectedImageIndex} 
                open={imageViewerOpen} 
                onOpenChange={(open) => {
                  setImageViewerOpen(open);
                  // Stay on the current page when the dialog is closed
                }} 
              />}
              
              <ListingDescription
                listing={listing}
                reviews={reviews}
                onAddReview={handleAddReview}
                showMetadata={true}
              />
              
              <div className="mt-6">
                {listing && (
                  <SellerDetailsCard
                    id={listing.id}
                    title={listing.title}
                    price={listing.price}
                    sellerId={listing.seller_id || ''}
                    sellerName={listing.seller_name}
                    sellerRating={listing.seller_rating}
                    sellerPhone={listing.seller_phone}
                    sellerWhatsapp={listing.seller_whatsapp}
                    sellerInstagram={listing.seller_instagram}
                    location={listing.location}
                    createdAt={listing.created_at}
                    mapLink={listing.map_link}
                    reviewCount={listing.review_count || 0}
                  />
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 mb-16">
            <SafeTradingTips />
          </div>
        </div>
      </div>
    </MainLayout>;
};

export default MarketplaceListingDetails;
