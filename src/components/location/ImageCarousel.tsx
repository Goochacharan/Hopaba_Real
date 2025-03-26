
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface ImageCarouselProps {
  images: string[];
  className?: string;
  onImageClick?: (index: number, e: React.MouseEvent) => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ 
  images, 
  className,
  onImageClick 
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
    <div className={cn("relative w-full overflow-hidden", className)}>
      <Carousel className="w-full h-full">
        <CarouselContent className="h-full">
          {images.map((img, index) => (
            <CarouselItem key={index} className="h-full p-0">
              <div className={cn("absolute inset-0 bg-muted/30", imageLoaded[index] ? "opacity-0" : "opacity-100")} />
              <img 
                src={img} 
                alt={`image ${index + 1}`} 
                onLoad={() => handleImageLoad(index)} 
                onClick={(e) => onImageClick && onImageClick(index, e)} 
                className={cn(
                  "w-full h-full object-cover transition-all-500 cursor-pointer", 
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
    </div>
  );
};

export default ImageCarousel;
