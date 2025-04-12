import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import { useToast } from '@/hooks/use-toast';
import ImageViewer from '@/components/ImageViewer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock, Image, FileWarning, Calendar } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Import our components
import ListingImageCarousel from './marketplace/ListingImageCarousel';
import ListingMetadata from './marketplace/ListingMetadata';
import SellerInfo from './marketplace/SellerInfo';
import ListingActionButtons from './marketplace/ListingActionButtons';
import CertificateBadge from './marketplace/CertificateBadge';

interface MarketplaceListingCardProps {
  listing: MarketplaceListing;
  className?: string;
}

const formatPrice = (price: number): string => {
  return price.toLocaleString('en-IN');
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
  const [currentImageType, setCurrentImageType] = React.useState<'regular' | 'damage'>('regular');

  const handleImageClick = (index: number, type: 'regular' | 'damage' = 'regular') => {
    setSelectedImageIndex(index);
    setCurrentImageType(type);
    setImageViewerOpen(true);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (imageViewerOpen) return;
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
      return;
    }
    console.log("Navigating to marketplace listing:", listing.id);
    navigate(`/marketplace/${listing.id}`);
  };

  const isSearchPage = window.location.pathname.includes('/search');
  const hasDamageImages = listing.damage_images && listing.damage_images.length > 0;

  return <div className={cn("group bg-white rounded-xl border border-border/50 overflow-hidden transition-all", "hover:shadow-lg hover:border-primary/20 hover:scale-[1.01]", "pb-5", className)} onClick={handleCardClick}>
      {hasDamageImages ? <Tabs defaultValue="regular" className="mb-2">
          <TabsList className="w-full mb-0 p-1 h-auto bg-transparent">
            <TabsTrigger value="regular" className="flex-1 h-8 text-xs py-0">
              <div className="flex items-center gap-1">
                <Image className="h-3 w-3" />
                <span>Images</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="damage" className="flex-1 h-8 text-xs py-0">
              <div className="flex items-center gap-1">
                <FileWarning className="h-3 w-3" />
                <span>Damage/Scratches</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="regular" className="mt-0 p-0">
            <div>
              <ListingImageCarousel images={listing.images} onImageClick={index => handleImageClick(index, 'regular')} listing={listing} />
            </div>
          </TabsContent>
          
          <TabsContent value="damage" className="mt-0 p-0">
            <div>
              <ListingImageCarousel images={listing.damage_images} onImageClick={index => handleImageClick(index, 'damage')} listing={listing} isDamageImages={true} />
            </div>
          </TabsContent>
        </Tabs> : <div>
          <ListingImageCarousel images={listing.images} onImageClick={index => handleImageClick(index)} listing={listing} />
        </div>}
      
      <div className="p-4 px-[13px] py-0 my-0">
        <h3 className="font-bold text-xl md:text-2xl mb-1">{listing.title}</h3>
        
        <div className="flex flex-col">
          <p className="text-gray-800 px-0 py-0 font-bold mb-0 text-xl md:text-xl flex items-center">
            <span className="text-xl md:text-xl mr-1">₹</span>{formatPrice(listing.price)}
          </p>
          
          <div className="mt-1 mb-2 flex flex-wrap gap-2 items-center">
            {listing.is_negotiable !== undefined && (listing.is_negotiable === true ? <Badge variant="success" className="inline-flex items-center gap-1 pr-1.5">
                  <Unlock className="h-3 w-3" />
                  <span className="pr-0.5">Negotiable</span>
                </Badge> : <Badge variant="default" className="inline-flex items-center gap-1 pr-1.5">
                  <Lock className="h-3 w-3" />
                  <span className="pr-0.5">Fixed</span>
                </Badge>)}
            {listing.inspection_certificates && listing.inspection_certificates.length > 0 && <span onClick={e => e.stopPropagation()}>
                <CertificateBadge certificates={listing.inspection_certificates} />
              </span>}
            {listing.model_year && <Badge variant="outline" className="inline-flex items-center gap-1 pr-1.5">
                <Calendar className="h-3 w-3" />
                <span className="pr-0.5">{listing.model_year}</span>
              </Badge>}
          </div>
        </div>
        
        <div className="mt-0">
          <ListingMetadata location={listing.location} createdAt={listing.created_at} condition={listing.condition} sellerInstagram={listing.seller_instagram} sellerName={listing.seller_name} />
        </div>

        <div className="flex justify-end items-center mb-4 px-0 mx-0 py-0 my-[11px]">
          <div className="flex flex-col items-end py-0">
            <SellerInfo sellerName={listing.seller_name} sellerRating={listing.seller_rating} sellerId={listing.seller_id} reviewCount={listing.review_count} sellerInstagram={listing.seller_instagram} createdAt={listing.created_at} />
          </div>
        </div>
        
        {isSearchPage ? <ScrollArea className="h-[120px] mb-4 pr-3">
            <p className="whitespace-pre-line text-gray-950 text-sm">
              {listing.description}
            </p>
          </ScrollArea> : <ScrollArea className="h-[120px] mb-4 pr-3">
            <p className="whitespace-pre-line text-gray-950 text-sm py-0 my-0">
              {listing.description}
            </p>
          </ScrollArea>}

        <ListingActionButtons listingId={listing.id} title={listing.title} price={listing.price} sellerPhone={listing.seller_phone} sellerWhatsapp={listing.seller_whatsapp} sellerInstagram={listing.seller_instagram} location={listing.location} mapLink={listing.map_link} />
      </div>

      <ImageViewer images={currentImageType === 'regular' ? listing.images : listing.damage_images || []} initialIndex={selectedImageIndex} open={imageViewerOpen} onOpenChange={open => {
      setImageViewerOpen(open);
    }} />
    </div>;
};

export default MarketplaceListingCard;
