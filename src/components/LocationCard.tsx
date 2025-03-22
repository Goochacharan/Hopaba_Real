
import React, { useState } from 'react';
import { Star, Clock, ExternalLink, Phone, MapPin, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Recommendation } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useAuth } from '@/hooks/useAuth';
import { useWishlist } from '@/contexts/WishlistContext';
import ImageViewer from '@/components/ImageViewer';
import NewBadge from '@/components/NewBadge';

interface LocationCardProps {
  item: Recommendation;
  onImageClick?: (index: number) => void;
}

const LocationCard: React.FC<LocationCardProps> = ({ item, onImageClick }) => {
  const navigate = useNavigate();
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { user } = useAuth();
  const { toggleWishlist, isItemWishlisted } = useWishlist();
  const isWishlisted = isItemWishlisted(item.id);

  const handleCardClick = () => {
    navigate(`/location/${item.id}`);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user) {
      toggleWishlist(item);
    } else {
      navigate('/login');
    }
  };

  const handleLocalImageClick = (e: React.MouseEvent, index: number = 0) => {
    e.stopPropagation();
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
    
    if (onImageClick) {
      onImageClick(index);
    }
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.phone) {
      window.open(`tel:${item.phone}`);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group bg-white rounded-xl border border-border/50 overflow-hidden shadow-sm hover:shadow transition-all cursor-pointer relative"
    >
      <NewBadge createdAt={item.created_at || new Date().toISOString()} />

      <div className="relative">
        <AspectRatio ratio={16/9} className="bg-muted">
          <img
            src={item.image || '/placeholder.svg'}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onClick={(e) => handleLocalImageClick(e)}
          />
        </AspectRatio>
        
        <Button
          onClick={handleHeartClick}
          size="sm"
          variant="outline"
          className={`absolute top-3 right-3 rounded-full w-8 h-8 p-0 ${
            isWishlisted ? 'bg-red-100 text-red-500 border-red-200' : 'bg-white/90 backdrop-blur-sm'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={isWishlisted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isWishlisted ? "text-red-500" : "text-gray-600"}
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </Button>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-lg">{item.name}</h3>
          <div className="flex items-center bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-xs">
            <Star className="h-3 w-3 fill-green-500 text-green-500 mr-0.5" />
            <span>{item.rating}</span>
          </div>
        </div>

        <div className="mt-1 text-muted-foreground text-sm">
          {item.category}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.tags?.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="bg-primary/5 text-primary-foreground/90 border-primary/10">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="mt-4 flex items-center text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 mr-1" />
          <span className="truncate max-w-[190px]">{item.address}</span>
        </div>

        <div className="mt-2 flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          <span>{item.openNow ? "Open" : "Closed"}</span>
          <span className="mx-1">•</span>
          <span>{item.hours}</span>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-xs text-muted-foreground">{item.distance}</div>
          
          <div className="flex gap-2">
            {item.phone && (
              <Button 
                size="sm" 
                variant="outline" 
                className="rounded-full w-8 h-8 p-0"
                onClick={handlePhoneClick}
              >
                <Phone className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button 
              size="sm" 
              className="rounded-full h-8 px-3 bg-primary"
            >
              <span className="mr-1">View</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
      
      <ImageViewer 
        images={item.images || [item.image]} 
        initialIndex={selectedImageIndex} 
        open={imageViewerOpen} 
        onOpenChange={setImageViewerOpen} 
      />
    </div>
  );
};

export default LocationCard;
