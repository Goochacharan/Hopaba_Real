
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { useMarketplaceListing } from '@/hooks/useMarketplaceListings';
import { ArrowLeft, AlertCircle, AlertTriangle } from 'lucide-react';
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
import { Separator } from "@/components/ui/separator";

const MarketplaceListingDetails = () => {
  const { id = '' } = useParams<{ id: string; }>();
  const navigate = useNavigate();
  const { listing, loading, error } = useMarketplaceListing(id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [damageImagesViewerOpen, setDamageImagesViewerOpen] = useState(false);
  const [selectedDamageImageIndex, setSelectedDamageImageIndex] = useState(0);
  
  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };

  const openDamageImageViewer = (index: number) => {
    setSelectedDamageImageIndex(index);
    setDamageImagesViewerOpen(true);
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

  const hasDamageImages = listing.damage_images && listing.damage_images.length > 0;
  
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
                <div className="flex items-center gap-2 my-2">
                  <h2 className="text-2xl font-bold flex items-center">
                    <span className="text-xl mr-1">₹</span>
                    {listing?.price.toLocaleString('en-IN')}
                  </h2>
                  {listing?.is_negotiable ? (
                    <Badge variant="success">Negotiable</Badge>
                  ) : (
                    <Badge variant="condition">Fixed Price</Badge>
                  )}
                  
                  {hasDamageImages && (
                    <Button 
                      variant="link" 
                      className="text-amber-500 flex items-center gap-1 p-0 h-auto"
                      onClick={() => {
                        const element = document.getElementById('damage-photos');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      <AlertTriangle size={16} />
                      <span>View damage photos</span>
                    </Button>
                  )}
                </div>
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
                description={listing?.description || ''} 
                category={listing?.category || ''} 
                condition={listing?.condition || ''} 
                location={listing?.location || ''} 
                createdAt={listing?.created_at || ''} 
                instagram={listing?.seller_instagram || ''}
                showMetadata={false} 
              />
              
              {hasDamageImages && (
                <div id="damage-photos" className="mt-8 mb-6 bg-black/5 rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 pb-3 bg-amber-50 border-b border-amber-100">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      <h3 className="text-lg font-medium text-amber-800">Damages & Scratches</h3>
                    </div>
                    <p className="text-sm text-amber-700 mt-1">
                      The seller has provided photos of damages or scratches on this item.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 p-4">
                    {listing.damage_images?.map((image, index) => (
                      <div 
                        key={`damage-${index}`} 
                        className="relative aspect-square cursor-pointer rounded-md overflow-hidden border hover:opacity-90 transition-opacity" 
                        onClick={() => openDamageImageViewer(index)}
                      >
                        <img 
                          src={image} 
                          alt={`Damage or scratch ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {listing.damage_images && listing.damage_images.length > 0 && (
                <ImageViewer 
                  images={listing.damage_images} 
                  initialIndex={selectedDamageImageIndex} 
                  open={damageImagesViewerOpen} 
                  onOpenChange={setDamageImagesViewerOpen} 
                />
              )}
              
              <div className="mt-6">
                {listing && (
                  <SellerDetailsCard
                    id={listing.id}
                    title={listing.title}
                    price={listing.price}
                    isNegotiable={listing.is_negotiable}
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
