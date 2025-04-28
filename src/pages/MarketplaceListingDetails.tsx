
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ListingImageCarousel from '@/components/marketplace/ListingImageCarousel';
import ListingThumbnails from '@/components/marketplace/ListingThumbnails';
import ListingDescription from '@/components/marketplace/ListingDescription';
import ImageViewer from '@/components/ImageViewer';
import SafeTradingTips from '@/components/marketplace/SafeTradingTips';
import SellerDetailsCard from '@/components/marketplace/SellerDetailsCard';
import InspectionCertificatesCard from '@/components/marketplace/InspectionCertificatesCard';
import ListingDetailsLoading from '@/components/marketplace/ListingDetailsLoading';
import ListingDetailsError from '@/components/marketplace/ListingDetailsError';
import ListingDetailsHeader from '@/components/marketplace/ListingDetailsHeader';
import { useListingDetails } from '@/hooks/useListingDetails';
import { Image, FileWarning } from 'lucide-react';

const MarketplaceListingDetails = () => {
  const navigate = useNavigate();
  const { listing, isLoading, error } = useListingDetails();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [damageImageIndex, setDamageImageIndex] = useState(0);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageType, setCurrentImageType] = useState<'regular' | 'damage'>('regular');
  
  const handleBackToMarketplace = () => {
    if (listing) {
      navigate(`/marketplace?highlight=${listing.id}&category=${listing.category}`);
    } else {
      navigate('/marketplace');
    }
  };

  if (isLoading) {
    return <MainLayout><ListingDetailsLoading /></MainLayout>;
  }
  
  if (error || !listing) {
    return (
      <MainLayout>
        <ListingDetailsError error={error} onBack={handleBackToMarketplace} />
      </MainLayout>
    );
  }
  
  const hasDamageImages = listing.damage_images && listing.damage_images.length > 0;
  
  const openImageViewer = (index: number, type: 'regular' | 'damage') => {
    if (type === 'regular') {
      setSelectedImageIndex(index);
    } else {
      setDamageImageIndex(index);
    }
    setCurrentImageType(type);
    setImageViewerOpen(true);
  };

  return (
    <MainLayout>
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
              <ListingDetailsHeader listing={listing} />
              
              <Tabs defaultValue="regular" className="mb-6">
                <TabsList className="mb-4">
                  <TabsTrigger value="regular" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    <span>Product Images</span>
                  </TabsTrigger>
                  {hasDamageImages && (
                    <TabsTrigger value="damage" className="flex items-center gap-2">
                      <FileWarning className="h-4 w-4" />
                      <span>Damage/Scratch Images</span>
                    </TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="regular" className="mt-0 bg-black/5 rounded-xl shadow-sm overflow-hidden">
                  <ListingImageCarousel 
                    images={listing.images} 
                    onImageClick={(index) => openImageViewer(index, 'regular')} 
                    listing={listing}
                  />
                  
                  <div className="p-4">
                    <ListingThumbnails 
                      images={listing.images} 
                      selectedIndex={selectedImageIndex} 
                      onSelect={(index) => {
                        setSelectedImageIndex(index);
                        openImageViewer(index, 'regular');
                      }} 
                    />
                  </div>
                </TabsContent>
                
                {hasDamageImages && (
                  <TabsContent value="damage" className="mt-0 bg-black/5 rounded-xl shadow-sm overflow-hidden">
                    <ListingImageCarousel 
                      images={listing.damage_images} 
                      onImageClick={(index) => openImageViewer(index, 'damage')} 
                      listing={listing}
                      isDamageImages={true}
                    />
                    
                    <div className="p-4">
                      <ListingThumbnails 
                        images={listing.damage_images || []} 
                        selectedIndex={damageImageIndex} 
                        onSelect={(index) => {
                          setDamageImageIndex(index);
                          openImageViewer(index, 'damage');
                        }}
                        isDamageImages={true}
                      />
                    </div>
                  </TabsContent>
                )}
              </Tabs>
              
              {listing && <ImageViewer 
                images={currentImageType === 'regular' ? listing.images : (listing.damage_images || [])} 
                initialIndex={currentImageType === 'regular' ? selectedImageIndex : damageImageIndex} 
                open={imageViewerOpen} 
                onOpenChange={(open) => {
                  setImageViewerOpen(open);
                }} 
              />}
              
              <ListingDescription 
                description={listing.description} 
                category={listing.category} 
                condition={listing.condition} 
                location={listing.location} 
                createdAt={listing.created_at} 
                instagram={listing.seller_instagram || ''}
                showMetadata={false} 
              />
              
              <div className="mt-6">
                <SellerDetailsCard
                  id={listing.id}
                  title={listing.title}
                  price={listing.price}
                  sellerId={listing.seller_id || ''}
                  sellerName={listing.seller_name}
                  sellerRating={listing.seller_rating || 0}
                  sellerPhone={listing.seller_phone}
                  sellerWhatsapp={listing.seller_whatsapp}
                  sellerInstagram={listing.seller_instagram}
                  location={listing.location}
                  createdAt={listing.created_at}
                  mapLink={listing.map_link}
                  reviewCount={listing.review_count}
                  isNegotiable={listing.is_negotiable}
                  ownershipNumber={listing.ownership_number}
                  inspectionCertificates={listing.inspection_certificates}
                />
                
                {listing.inspection_certificates && listing.inspection_certificates.length > 0 && (
                  <InspectionCertificatesCard
                    certificates={listing.inspection_certificates}
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
    </MainLayout>
  );
};

export default MarketplaceListingDetails;
