
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

const MarketplaceListingCard: React.FC<MarketplaceListingCardProps> = ({ listing, className }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [imageViewerOpen, setImageViewerOpen] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };

  const handleCardClick = () => {
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
      <ListingImageCarousel 
        images={listing.images}
        onImageClick={handleImageClick}
      />
      
      <div className="p-4">
        <h3 className="font-medium text-lg md:text-xl mb-2">{listing.title}</h3>
        
        <ListingMetadata 
          location={listing.location}
          createdAt={listing.created_at}
          condition={listing.condition}
        />

        <div className="flex justify-between items-start mb-4">
          <p className="text-xl font-bold text-[#1EAEDB]">{formatPrice(listing.price)}</p>
          
          <SellerInfo 
            sellerName={listing.seller_name}
            sellerRating={listing.seller_rating}
          />
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
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
        onOpenChange={setImageViewerOpen}
      />
    </div>
  );
};

export default MarketplaceListingCard;
