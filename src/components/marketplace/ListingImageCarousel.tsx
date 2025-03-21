import React from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/contexts/WishlistContext';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import { useToast } from '@/hooks/use-toast';
interface ListingImageCarouselProps {
  images: string[] | null;
  onImageClick?: (index: number) => void;
  className?: string;
  listing: MarketplaceListing;
}
const ListingImageCarousel: React.FC<ListingImageCarouselProps> = ({
  images,
  onImageClick,
  className,
  listing
}) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  } = useWishlist();
  const {
    toast
  } = useToast();
  const isInWishlistAlready = isInWishlist(listing.id);

  // Use default image if no images are provided
  const imageArray = images && images.length > 0 ? images : ['/placeholder.svg'];
  const handlePreviousImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => prev === 0 ? imageArray.length - 1 : prev - 1);
  };
  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => prev === imageArray.length - 1 ? 0 : prev + 1);
  };
  const handleImageClick = (index: number, e: React.MouseEvent) => {
    if (onImageClick) {
      e.stopPropagation();
      onImageClick(index);
    }
  };
  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInWishlistAlready) {
      removeFromWishlist(listing.id);
      toast({
        title: "Removed from wishlist",
        description: `${listing.title} has been removed from your wishlist.`
      });
    } else {
      addToWishlist(listing, 'marketplace');
      toast({
        title: "Added to wishlist",
        description: `${listing.title} has been added to your wishlist.`
      });
    }
  };
  return <div className={cn("relative group", className)}>
      <AspectRatio ratio={4 / 3} className="bg-muted">
        <img src={imageArray[currentImageIndex]} alt={`Product image ${currentImageIndex + 1}`} onClick={e => handleImageClick(currentImageIndex, e)} className="w-full h-full object-cover" />
        
        {/* Wishlist button */}
        <Button size="icon" variant="secondary" className={cn("absolute top-2 right-2 z-10 opacity-90 shadow-md", isInWishlistAlready ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-background text-foreground")} onClick={toggleWishlist}>
          <Heart className={cn("h-5 w-5", isInWishlistAlready ? "fill-current" : "")} />
        </Button>

        {/* Navigation buttons - only show if more than one image */}
        {imageArray.length > 1 && <>
            <Button size="icon" variant="ghost" className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 hover:bg-background/70" onClick={handlePreviousImage}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <Button size="icon" variant="ghost" className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 hover:bg-background/70" onClick={handleNextImage}>
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>}
      </AspectRatio>
      
      {/* Image indicators - only show if more than one image */}
      {imageArray.length > 1 && <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
          {imageArray.map((_, index) => <button key={index} className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-primary scale-125' : 'bg-background/70 hover:bg-background'}`} onClick={e => {
        e.stopPropagation();
        setCurrentImageIndex(index);
      }} aria-label={`View image ${index + 1}`} />)}
        </div>}
    </div>;
};
export default ListingImageCarousel;