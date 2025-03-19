
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

const MarketplaceListingDetails = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { listing, loading, error } = useMarketplaceListing(id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  
  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4 max-w-6xl animate-pulse">
          <div className="mb-8 h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 gap-8">
            <div>
              <div className="h-[450px] bg-gray-200 rounded-xl mb-4"></div>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !listing) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4 max-w-6xl">
          <Link to="/marketplace" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Marketplace</span>
          </Link>
          
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || "Failed to load listing details"}</AlertDescription>
          </Alert>
          
          <Button asChild>
            <Link to="/marketplace">Browse other listings</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-4 px-4">
        <Link to="/marketplace" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Marketplace</span>
        </Link>
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <div className="mb-6">
              <Badge className="mb-2">{listing?.category}</Badge>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{listing?.title}</h1>
              <ListingMetadata 
                location={listing.location}
                createdAt={listing.created_at}
                condition={listing.condition}
              />
            </div>
            
            <div className="mb-6 overflow-hidden">
              <ListingImageCarousel 
                images={listing.images}
                onImageClick={openImageViewer}
              />
              
              <div className="mt-4 bg-white p-4 rounded-xl shadow-sm">
                <ListingThumbnails
                  images={listing.images}
                  selectedIndex={selectedImageIndex}
                  onSelect={(index) => {
                    setSelectedImageIndex(index);
                    openImageViewer(index);
                  }}
                />
              </div>
            </div>
            
            {listing && (
              <ImageViewer 
                images={listing.images} 
                initialIndex={selectedImageIndex}
                open={imageViewerOpen}
                onOpenChange={setImageViewerOpen}
              />
            )}
            
            <div className="mt-6 bg-white p-6 rounded-xl shadow-sm">
              <ListingDescription
                description={listing.description}
                category={listing.category}
                condition={listing.condition}
                location={listing.location}
                createdAt={listing.created_at}
                showMetadata={false}
              />
              
              <div className="mt-8">
                <SafeTradingTips />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MarketplaceListingDetails;
