
import React, { useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

interface LocationImageCarouselProps {
  images: string[];
  onImageClick: (index: number, e: React.MouseEvent) => void;
  heightClass: string;
  shouldIncreaseHeight: boolean;
}

const LocationImageCarousel: React.FC<LocationImageCarouselProps> = ({
  images,
  onImageClick,
  heightClass,
  shouldIncreaseHeight
}) => {
  const [imageLoaded, setImageLoaded] = useState<boolean[]>(Array(images.length).fill(false));
  
  const handleImageLoad = (index: number) => {
    setImageLoaded(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };
  
  return (
    <Carousel className="w-full h-full">
      <CarouselContent className="h-full">
        {images.map((img, index) => (
          <CarouselItem key={index} className="h-full p-0">
            <div className={cn("absolute inset-0 bg-muted/30", imageLoaded[index] ? "opacity-0" : "opacity-100")} />
            <img 
              src={img} 
              alt={`Image ${index + 1}`} 
              onLoad={() => handleImageLoad(index)} 
              onClick={e => onImageClick(index, e)} 
              className={cn(
                "w-full transition-all-500 cursor-pointer", 
                heightClass, 
                shouldIncreaseHeight ? "object-cover" : "object-contain", 
                imageLoaded[index] ? "opacity-100 blur-0" : "opacity-0 blur-sm"
              )} 
            />
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
  );
};

export default LocationImageCarousel;
