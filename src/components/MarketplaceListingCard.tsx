
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import { useToast } from '@/hooks/use-toast';
import ImageViewer from '@/components/ImageViewer';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const {
    toast
  } = useToast();
  const [imageViewerOpen, setImageViewerOpen] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };
  const handleCardClick = (e: React.MouseEvent) => {
    if (imageViewerOpen) return;
    navigate(`/marketplace/${listing.id}`);
  };
  return <div onClick={handleCardClick} className={cn("group bg-white rounded-xl border border-border/50 overflow-hidden transition-all cursor-pointer", "hover:shadow-lg hover:border-primary/20 hover:scale-[1.01]", className)}>
      <ListingImageCarousel images={listing.images} onImageClick={handleImageClick} listing={listing} />
      
      <div className="p-4 px-[12px] py-[16px]">
        <h3 className="font-bold text-xl md:text-2xl mb-1">{listing.title}</h3>
        
        <p className="text-gray-800 md:text-2xl px-0 py-0 font-extrabold mb-0 text-xl">
          {formatPrice(listing.price)}
        </p>
        
        <div className="mt-0">
          <ListingMetadata location={listing.location} createdAt={listing.created_at} condition={listing.condition} sellerInstagram={listing.seller_instagram} sellerName={listing.seller_name} />
        </div>

        <div className="flex justify-end items-center mb-4 my-0 px-0 mx-0 py-[10px]">
          <div className="flex flex-col items-end py-0">
            <SellerInfo sellerName={listing.seller_name} sellerRating={listing.seller_rating} sellerId={listing.seller_id} reviewCount={listing.review_count} sellerInstagram={listing.seller_instagram} createdAt={listing.created_at} />
          </div>
        </div>
        
        <ScrollArea className="h-[280px] mb-4 pr-3">
          <p className="whitespace-pre-line text-gray-950 text-base">
            {listing.description}
          </p>
        </ScrollArea>

        <ListingActionButtons listingId={listing.id} title={listing.title} price={listing.price} sellerPhone={listing.seller_phone} sellerWhatsapp={listing.seller_whatsapp} sellerInstagram={listing.seller_instagram} location={listing.location} mapLink={listing.map_link} />
      </div>

      <ImageViewer images={listing.images} initialIndex={selectedImageIndex} open={imageViewerOpen} onOpenChange={open => {
      setImageViewerOpen(open);
      // The dialog handles its own state, no need to navigate
    }} />
    </div>;
};
export default MarketplaceListingCard;
