
import React from 'react';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';

interface ListingImageCarouselProps {
  images: string[];
  onImageClick: (index: number) => void;
  listing?: any; // Add listing prop for wishlist functionality
}

const ListingImageCarousel: React.FC<ListingImageCarouselProps> = ({
  images,
  onImageClick,
  listing
}) => {
  const [imageLoaded, setImageLoaded] = React.useState<boolean[]>([]);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  
  React.useEffect(() => {
    setImageLoaded(Array(images.length).fill(false));
  }, [images.length]);

  const handleImageLoad = (index: number) => {
    setImageLoaded(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  const handleImageClickWrapper = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    onImageClick(index);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!listing) return;
    
    if (isInWishlist(listing.id)) {
      removeFromWishlist(listing.id);
      toast({
        title: "Removed from wishlist",
        description: `${listing.title} has been removed from your wishlist`
      });
    } else {
      addToWishlist(listing);
      toast({
        title: "Added to wishlist",
        description: `${listing.title} has been added to your wishlist`
      });
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      {listing && (
        <button
          onClick={handleWishlistToggle}
          className={cn(
            "absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 shadow-md transition-colors",
            "hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary",
            isInWishlist(listing.id) ? "text-red-500" : "text-gray-500"
          )}
          aria-label={isInWishlist(listing.id) ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart 
            className={cn(
              "h-6 w-6",
              isInWishlist(listing.id) ? "fill-current" : ""
            )} 
          />
        </button>
      )}
      
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((img, index) => (
            <CarouselItem key={index} className="p-0">
              <div 
                className="relative w-full"
                onClick={(e) => handleImageClickWrapper(e, index)}
              >
                <AspectRatio ratio={4/3}>
                  <div className={cn(
                    "absolute inset-0 bg-muted/30",
                    imageLoaded[index] ? "opacity-0" : "opacity-100"
                  )} />
                  <img
                    src={img || '/placeholder.svg'} 
                    alt={`Image ${index + 1}`}
                    onLoad={() => handleImageLoad(index)}
                    className={cn(
                      "w-full h-full object-cover transition-all cursor-pointer",
                      imageLoaded[index] ? "opacity-100 blur-0" : "opacity-0 blur-sm"
                    )}
                  />
                </AspectRatio>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <CarouselPrevious className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2" />
            <CarouselNext className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2" />
          </>
        )}
      </Carousel>
    </div>
  );
};

export default ListingImageCarousel;
