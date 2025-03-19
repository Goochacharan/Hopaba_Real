
import React from 'react';
import { cn } from '@/lib/utils';
import { AspectRatio } from '@/components/ui/aspect-ratio';
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
}

const ListingImageCarousel: React.FC<ListingImageCarouselProps> = ({
  images,
  onImageClick
}) => {
  const [imageLoaded, setImageLoaded] = React.useState<boolean[]>([]);
  
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

  return (
    <div className="relative w-full overflow-hidden">
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((img, index) => (
            <CarouselItem key={index} className="p-0">
              <div 
                className="relative w-full"
                onClick={(e) => handleImageClickWrapper(e, index)}
              >
                <AspectRatio ratio={16/9}>
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
