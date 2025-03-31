
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Clock, Star, Share2, MessageCircle, Navigation2, Heart, HeartOff, Instagram, Film } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useWishlist } from '@/contexts/WishlistContext';
import { Button } from './ui/button';

interface Recommendation {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  images?: string[];
  rating: number;
  address: string;
  phone?: string;
  website?: string;
  openNow?: boolean;
  hours?: string;
  availability?: string;
  distance?: string;
  instagram?: string;
  reviewCount?: number;
  tags: string[];
  map_link?: string;
  hiddenGemCount?: number;
  mustVisitCount?: number;
  isHiddenGem?: boolean;
  isMustVisit?: boolean;
  priceLevel?: string;
  price_level?: string;
  price_range_min?: number;
  price_range_max?: number;
  price_unit?: string;
  availability_days?: string[];
  availability_start_time?: string;
  availability_end_time?: string;
  created_at?: string;
}

interface LocationCardProps {
  recommendation: Recommendation;
  onClick?: (recommendation: Recommendation) => void;
  showDistanceUnderAddress?: boolean;
  className?: string;
  hideActions?: boolean;
  showRating?: boolean;
  wrapperClassName?: string;
}

const LocationCard: React.FC<LocationCardProps> = ({ 
  recommendation, 
  onClick,
  showDistanceUnderAddress = false,
  className,
  hideActions = false,
  showRating = true,
  wrapperClassName
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const inWishlist = isInWishlist(recommendation.id);
  
  const hasInstaStories = recommendation.instagram && recommendation.instagram.trim() !== '';
  
  const handleCardClick = () => {
    if (onClick) {
      onClick(recommendation);
    } else {
      // Always navigate to location/:id for business details
      navigate(`/location/${recommendation.id}`);
    }
  };
  
  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToWishlist(recommendation);
    toast({
      title: "Added to wishlist",
      description: `${recommendation.name} has been added to your wishlist.`,
    });
  };

  const handleRemoveFromWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromWishlist(recommendation.id);
    toast({
      title: "Removed from wishlist",
      description: `${recommendation.name} has been removed from your wishlist.`,
    });
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (recommendation.phone) {
      window.open(`tel:${recommendation.phone}`);
      toast({
        title: 'Calling',
        description: `Calling ${recommendation.name}...`
      });
    }
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (recommendation.phone) {
      const message = encodeURIComponent(`Hi, I'm interested in ${recommendation.name}`);
      window.open(`https://wa.me/${recommendation.phone}?text=${message}`);
      toast({
        title: 'WhatsApp',
        description: `Opening WhatsApp chat with ${recommendation.name}...`
      });
    }
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const address = encodeURIComponent(recommendation.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`);
    toast({
      title: 'Directions',
      description: `Getting directions to ${recommendation.name}...`
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: recommendation.name,
        text: `Check out ${recommendation.name}`,
        url: window.location.href
      }).catch(error => {
        console.error('Error sharing:', error);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'Link copied to clipboard'
      });
    }
  };

  const handleInstagramClick = (e: React.MouseEvent, instagram: string | undefined, businessName: string) => {
    e.stopPropagation();
    if (instagram) {
      window.open(instagram);
      toast({
        title: "Opening video content",
        description: `Visiting ${businessName}'s video content`,
        duration: 2000
      });
    } else {
      toast({
        title: "Video content not available",
        description: "This business has not provided any video links",
        variant: "destructive",
        duration: 2000
      });
    }
  };

  return (
    <div className={cn("relative", wrapperClassName)}>
      <Card className={cn("overflow-hidden cursor-pointer hover:shadow-md transition-shadow", className)} onClick={handleCardClick}>
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex justify-between items-start">
            <span>{recommendation.name}</span>
            <span className="text-sm font-normal text-muted-foreground px-2 py-1 bg-muted rounded-md">
              {recommendation.category}
            </span>
          </CardTitle>
          <CardDescription className="line-clamp-2">{recommendation.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{recommendation.address}</span>
            {showDistanceUnderAddress && recommendation.distance && (
              <span className="text-xs text-muted-foreground ml-1">
                ({recommendation.distance})
              </span>
            )}
          </div>
          {recommendation.availability && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{recommendation.availability}</span>
            </div>
          )}
          {recommendation.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{recommendation.phone}</span>
            </div>
          )}
          {recommendation.instagram && (
            <div className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-muted-foreground" />
              <span>{recommendation.instagram}</span>
              {hasInstaStories && (
                <button 
                  onClick={(e) => handleInstagramClick(e, recommendation.instagram, recommendation.name)}
                  title="Watch video content" 
                  className="bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 rounded-full hover:shadow-md transition-all ml-2 px-4 py-2"
                >
                  <Film className="h-5 w-5 text-white" />
                </button>
              )}
            </div>
          )}
          {recommendation.tags && recommendation.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recommendation.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        {!hideActions && (
          <CardFooter className="border-t bg-muted/10 gap-2" onClick={e => e.stopPropagation()}>
            <Button 
              variant="default" 
              size="sm" 
              className="w-full flex items-center justify-center gap-2"
              onClick={handleCall}
            >
              <Phone size={16} />
              Call
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="w-full flex items-center justify-center gap-2"
              onClick={handleWhatsApp}
            >
              <MessageCircle size={16} />
              Chat
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="w-full flex items-center justify-center gap-2"
              onClick={handleDirections}
            >
              <Navigation2 size={16} />
              Directions
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="w-full flex items-center justify-center gap-2"
              onClick={handleShare}
            >
              <Share2 size={16} />
              Share
            </Button>
          </CardFooter>
        )}
      </Card>
      {showRating && (
        <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground rounded-md px-2 py-1 flex items-center">
          <Star className="h-4 w-4 mr-1 text-yellow-500" />
          <span>{recommendation.rating?.toFixed(1) || '4.5'}</span>
        </div>
      )}
      {user && (
        <button
          onClick={inWishlist ? handleRemoveFromWishlist : handleAddToWishlist}
          className="absolute top-2 left-2 bg-secondary text-secondary-foreground rounded-md p-1 hover:bg-muted transition-colors"
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          {inWishlist ? <HeartOff className="h-5 w-5" /> : <Heart className="h-5 w-5" />}
        </button>
      )}
    </div>
  );
};

export default LocationCard;
