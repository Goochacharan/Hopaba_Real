
import React, { useRef } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ListingThumbnailsProps {
  images: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const ListingThumbnails: React.FC<ListingThumbnailsProps> = ({
  images,
  selectedIndex,
  onSelect
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const scrollAmount = 200; // Adjust as needed
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      scrollThumbnails('right');
    } else if (isRightSwipe) {
      scrollThumbnails('left');
    }
    
    // Reset touch coordinates
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (images.length <= 1) return null;

  return (
    <div className="relative mt-4">
      {images.length > 5 && (
        <>
          <button 
            onClick={() => scrollThumbnails('left')}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-background/70 rounded-full p-1 shadow-md"
            aria-label="Scroll thumbnails left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <button 
            onClick={() => scrollThumbnails('right')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-background/70 rounded-full p-1 shadow-md"
            aria-label="Scroll thumbnails right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
      
      <div 
        ref={containerRef}
        className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 overflow-x-auto scrollbar-hide pb-2 px-1"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((image, index) => (
          <div
            key={index}
            onClick={() => onSelect(index)}
            className={`cursor-pointer rounded-lg overflow-hidden transition-all border-2 ${
              selectedIndex === index ? 'border-[#1EAEDB] shadow-md' : 'border-transparent'
            }`}
          >
            <AspectRatio ratio={1/1} className="bg-muted">
              <img
                src={image || '/placeholder.svg'}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </AspectRatio>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListingThumbnails;
