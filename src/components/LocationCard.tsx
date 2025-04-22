
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Building, MapPin, Clock, Star, Heart, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useWishlist } from '@/contexts/WishlistContext';
import RatingProgressBars from '@/components/RatingProgressBars';

interface LocationCardProps {
  location: any;
  showDistance?: boolean;
  handleHeartClick?: (event: React.MouseEvent, recommendationId: string) => void;
}

const LocationCard: React.FC<LocationCardProps> = ({ 
  location,
  showDistance = true,
  handleHeartClick,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pathname } = useLocation();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const isLocationInWishlist = isInWishlist(location.id);

  const isBusinessPage = pathname.includes('business');
  
  const handleClickLocation = () => {
    navigate(`/location/${location.id}`);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isLocationInWishlist) {
      removeFromWishlist(location.id);
      toast({
        title: "Removed from favorites",
        description: `${location.name} has been removed from your favorites.`,
        duration: 2000,
      });
    } else {
      addToWishlist({
        id: location.id,
        name: location.name,
        category: location.category,
        rating: location.rating || 0,
        image_url: location.image_url,
        address: location.address,
      });
      toast({
        title: "Added to favorites",
        description: `${location.name} has been added to your favorites.`,
        duration: 2000,
      });
    }
  };

  const handleClickWebsite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (location.website) {
      window.open(location.website, '_blank');
    }
  };

  // Sample criteria ratings for demonstration
  const criteriaRatings = [
    { name: 'Hygiene', rating: 8.5 },
    { name: 'Service', rating: 7.8 },
    { name: 'Value', rating: 9.2 },
    { name: 'Quality', rating: 8.9 }
  ];

  return (
    <Card 
      className="group overflow-hidden relative hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={handleClickLocation}
    >
      <div className="relative aspect-video w-full overflow-hidden">
        {location.image_url ? (
          <img 
            src={location.image_url} 
            alt={location.name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Building className="w-10 h-10 text-muted-foreground" />
          </div>
        )}
        {/* Badges section */}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          {showDistance && location.distance && (
            <Badge variant="secondary" className="bg-primary/80 text-primary-foreground">
              {location.distance.toFixed(1)} km
            </Badge>
          )}
          
          {location.isHiddenGem && (
            <Badge variant="secondary" className="bg-teal-500/80 text-white">
              Hidden Gem
            </Badge>
          )}
          
          {location.isMustVisit && (
            <Badge variant="secondary" className="bg-amber-500/80 text-amber-950">
              Must Visit
            </Badge>
          )}
        </div>
        
        {/* Heart button */}
        <Button
          onClick={handleHeartClick || toggleWishlist}
          size="icon"
          variant="secondary"
          className={`absolute top-2 left-2 w-8 h-8 rounded-full ${isLocationInWishlist ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-background/80 hover:bg-background'}`}
        >
          <Heart className={`h-4 w-4 ${isLocationInWishlist ? 'fill-current' : ''}`} />
          <span className="sr-only">Toggle favorite</span>
        </Button>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="font-medium text-lg line-clamp-1">{location.name}</h3>
          <div className="flex items-center text-muted-foreground text-sm">
            <span className="line-clamp-1">{location.category}</span>
          </div>
        </div>
        
        {/* Rating section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-primary text-primary mr-1" />
            <span className="font-medium">{location.rating?.toFixed(1) || '0.0'}</span>
            <span className="text-muted-foreground text-sm ml-1">
              ({location.review_count || 0} reviews)
            </span>
          </div>
          
          {location.price_level && (
            <div className="text-muted-foreground">
              {'₹'.repeat(location.price_level)}
            </div>
          )}
        </div>
        
        {/* Add Rating Progress Bars here */}
        <RatingProgressBars ratings={criteriaRatings} />
        
        {/* Location and hours */}
        <div className="space-y-2 text-sm">
          {location.address && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <span className="line-clamp-2 text-muted-foreground">{location.address}</span>
            </div>
          )}
          
          {location.hours && (
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{location.hours}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer with actions */}
      <div className="px-4 pb-4 pt-0">
        {location.tags && location.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {location.tags.slice(0, 3).map((tag: string, i: number) => (
              <Badge key={i} variant="outline" className="text-xs bg-primary/5">
                {tag}
              </Badge>
            ))}
            {location.tags.length > 3 && (
              <Badge variant="outline" className="text-xs bg-muted">
                +{location.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <Button 
            size="sm" 
            variant="default"
            className="w-full"
            onClick={handleClickLocation}
          >
            View Details
          </Button>
          
          {location.website && !isBusinessPage && (
            <Button
              size="icon"
              variant="ghost"
              className="ml-2"
              onClick={handleClickWebsite}
            >
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">Visit website</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default LocationCard;
