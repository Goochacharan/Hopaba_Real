
import React from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

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
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 mt-4">
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
  );
};

export default ListingThumbnails;
