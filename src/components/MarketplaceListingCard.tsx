
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import { useToast } from '@/hooks/use-toast';
import ImageViewer from '@/components/ImageViewer';

// Import our new components
import ListingImageCarousel from './marketplace/ListingImageCarousel';
import ListingMetadata from './marketplace/ListingMetadata';
import SellerInfo from './marketplace/SellerInfo';
import ListingActionButtons from './marketplace/ListingActionButtons';

interface MarketplaceListingCardProps {
  listing: MarketplaceListing;
  className?: string;
}

const formatPrice = (price: number): string => {
  return '₹' + price.toLocaleString('en-IN');
};

const MarketplaceListingCard: React.FC<MarketplaceListingCardProps> = ({
  listing,
  className
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [imageViewerOpen, setImageViewerOpen] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if image viewer is open
    if (imageViewerOpen) return;
    navigate(`/marketplace/${listing.id}`);
  };

  return (
    <div 
      onClick={handleCardClick} 
      className={cn(
        "group bg-white rounded-xl border border-border/50 overflow-hidden transition-all cursor-pointer", 
        "hover:shadow-lg hover:border-primary/20 hover:scale-[1.01]", 
        className
      )}
    >
      <ListingImageCarousel images={listing.images} onImageClick={handleImageClick} listing={listing} />
      
      <div className="p-4 px-[12px] py-[16px]">
        <h3 className="font-bold text-xl md:text-2xl mb-2">{listing.title}</h3>
        
        <div className="mb-4">
          <ListingMetadata 
            location={listing.location} 
            createdAt={listing.created_at} 
            condition={listing.condition} 
            sellerInstagram={listing.seller_instagram} 
            sellerName={listing.seller_name} 
          />
        </div>

        <div className="flex justify-between items-center mb-4 py-0 my-0">
          <div className="flex items-center">
            <p className="font-bold text-3xl md:text-4xl text-gray-800 px-[9px]">{formatPrice(listing.price)}</p>
          </div>
          
          <div className="flex flex-col items-end py-0">
            <SellerInfo 
              sellerName={listing.seller_name} 
              sellerRating={listing.seller_rating} 
              sellerId={listing.seller_id} 
              createdAt={listing.created_at} 
            />
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-4">
          {listing.description}
        </p>

        <ListingActionButtons 
          listingId={listing.id} 
          title={listing.title} 
          price={listing.price} 
          sellerPhone={listing.seller_phone} 
          sellerWhatsapp={listing.seller_whatsapp} 
          sellerInstagram={listing.seller_instagram} 
          location={listing.location} 
        />
      </div>

      <ImageViewer 
        images={listing.images} 
        initialIndex={selectedImageIndex} 
        open={imageViewerOpen} 
        onOpenChange={open => {
          setImageViewerOpen(open);
          // The dialog handles its own state, no need to navigate
        }} 
      />
    </div>
  );
};

export default MarketplaceListingCard;
