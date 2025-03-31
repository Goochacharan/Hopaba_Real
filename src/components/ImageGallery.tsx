
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ImageGalleryProps {
  images: string[];
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, className }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setShowLightbox(true);
  };

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-md flex items-center justify-center h-56 ${className}`}>
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <>
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-2 ${className}`}>
        {/* Main image (larger) */}
        <div 
          className="md:col-span-2 h-56 md:h-80 bg-gray-100 rounded-md overflow-hidden relative cursor-pointer"
          onClick={() => openLightbox(0)}
        >
          <img 
            src={images[0]} 
            alt="Main" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Thumbnail images */}
        {images.slice(1, 5).map((image, index) => (
          <div 
            key={index + 1}
            className="h-32 bg-gray-100 rounded-md overflow-hidden relative cursor-pointer"
            onClick={() => openLightbox(index + 1)}
          >
            <img 
              src={image} 
              alt={`Thumbnail ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            {index === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <span className="text-white text-lg font-medium">+{images.length - 5}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
        <DialogContent className="max-w-4xl p-0 border-none">
          <div className="relative h-[80vh] bg-black">
            <img
              src={images[currentImageIndex]}
              alt={`Gallery image ${currentImageIndex + 1}`}
              className="w-full h-full object-contain"
            />
            <button
              className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 rounded-full text-white"
              onClick={() => setShowLightbox(false)}
            >
              <X size={20} />
            </button>
            <button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 rounded-full text-white"
              onClick={handlePrevImage}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 rounded-full text-white"
              onClick={handleNextImage}
            >
              <ChevronRight size={24} />
            </button>
            <div className="absolute bottom-4 left-0 right-0 text-center text-white">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageGallery;
