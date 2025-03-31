
import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface LocationHeaderProps {
  name: string;
  rating: number;
  reviewCount: number;
  images: string[];
  onImageClick: (index: number) => void;
}

const LocationHeader = ({ name, rating, reviewCount, onImageClick, images }: LocationHeaderProps) => {
  const [imageLoaded, setImageLoaded] = useState<boolean[]>(Array(images.length).fill(false));

  const handleImageLoad = (index: number) => {
    setImageLoaded(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden mb-6">
      <div className="w-full h-[400px] relative overflow-hidden">
        <Carousel className="w-full h-full">
          <CarouselContent className="h-full">
            {images.map((img, index) => (
              <CarouselItem key={index} className="h-full relative">
                <div className={`absolute inset-0 bg-muted/30 ${imageLoaded[index] ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} />
                <img 
                  src={img} 
                  alt={`${name} - image ${index + 1}`} 
                  className={`w-full h-[400px] object-cover transition-all duration-500 ${imageLoaded[index] ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'} cursor-pointer`} 
                  onLoad={() => handleImageLoad(index)}
                  onClick={() => onImageClick(index)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {images.length > 1 && (
            <>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white/90" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white/90" />
            </>
          )}
        </Carousel>
      </div>
      
      <div className="p-6">
        <div className="mb-2">
          <h1 className="text-3xl font-bold">{name}</h1>
        </div>
        
        <div className="flex items-center mb-4">
          <div className="flex items-center text-amber-500">
            <span className="text-lg font-semibold mr-1 text-amber-700">{rating.toFixed(1)}</span>
            <Star className="fill-amber-500 w-4 h-4" />
          </div>
          <span className="text-xs text-muted-foreground ml-1">
            ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      </div>
    </div>
  );
};

export default LocationHeader;
