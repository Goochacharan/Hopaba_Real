
import React from 'react';
import { ImageViewer } from '@/components/ImageViewer';

interface SellerShopImagesProps {
  images: string[];
}

const SellerShopImages: React.FC<SellerShopImagesProps> = ({ images }) => {
  if (!images || images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No shop images available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <ImageViewer 
          key={index}
          src={image}
          alt={`Shop image ${index + 1}`}
          className="w-full h-48 object-cover rounded-lg"
        />
      ))}
    </div>
  );
};

export default SellerShopImages;
