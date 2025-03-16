
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MapPin, Star, Clock, Phone, MessageSquare, Heart } from 'lucide-react';
import { Recommendation } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useWishlist } from '@/contexts/WishlistContext';
import { Badge } from '@/components/ui/badge';

interface LocationCardProps {
  recommendation: Recommendation;
  className?: string;
  ranking?: number;
}

const LocationCard: React.FC<LocationCardProps> = ({ 
  recommendation, 
  className,
  ranking
}) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const { toast } = useToast();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(recommendation.id);

  // Helper function to get medal styling based on ranking
  const getMedalStyle = (rank: number) => {
    switch(rank) {
      case 1:
        return "bg-gradient-to-b from-yellow-300 to-yellow-500 border-yellow-200 text-yellow-900 shadow-md shadow-yellow-200/50"; // Gold
      case 2:
        return "bg-gradient-to-b from-gray-200 to-gray-400 border-gray-100 text-gray-800 shadow-md shadow-gray-200/50"; // Silver
      case 3:
        return "bg-gradient-to-b from-amber-300 to-amber-600 border-amber-200 text-amber-900 shadow-md shadow-amber-200/50"; // Bronze
      default:
        return "bg-gradient-to-b from-blue-400 to-blue-600 border-blue-300 text-white shadow shadow-blue-300/30"; // Regular blue
    }
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    // Simulate phone functionality - would integrate with real phone API
    toast({
      title: "Calling",
      description: `Calling ${recommendation.name}...`,
      duration: 3000,
    });
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    // Simulate WhatsApp integration - would open WhatsApp with predefined message
    toast({
      title: "Opening WhatsApp",
      description: `Messaging ${recommendation.name} via WhatsApp...`,
      duration: 3000,
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    
    if (inWishlist) {
      removeFromWishlist(recommendation.id);
      toast({
        title: "Removed from wishlist",
        description: `${recommendation.name} removed from your wishlist`,
        duration: 2000,
      });
    } else {
      addToWishlist(recommendation);
      toast({
        title: "Added to wishlist",
        description: `${recommendation.name} added to your wishlist`,
        duration: 2000,
      });
    }
  };

  const handleCardClick = () => {
    navigate(`/location/${recommendation.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className={cn(
        "group bg-white rounded-xl border border-border/50 overflow-hidden transition-all-300 cursor-pointer",
        "hover:shadow-lg hover:border-primary/20 hover:scale-[1.01]",
        className
      )}
    >
      <div className="relative w-full h-48 overflow-hidden">
        {ranking !== undefined && (
          <div className="absolute top-3 left-3 z-10">
            <div 
              className={cn(
                "flex items-center justify-center h-9 w-9 rounded-full text-lg font-bold border-2",
                "transform transition-all duration-300 group-hover:scale-110",
                getMedalStyle(ranking)
              )}
            >
              {ranking}
            </div>
          </div>
        )}
        
        <div className={cn(
          "absolute inset-0 bg-muted/30",
          imageLoaded ? "opacity-0" : "opacity-100"
        )} />
        <img
          src={recommendation.image}
          alt={recommendation.name}
          onLoad={() => setImageLoaded(true)}
          className={cn(
            "w-full h-full object-cover transition-all-500",
            imageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
          )}
        />
        <div className="absolute top-3 left-14">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-black/40 backdrop-blur-sm text-white">
            {recommendation.category}
          </span>
        </div>
        
        <button 
          onClick={handleWishlistToggle}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all",
            inWishlist ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"
          )}
        >
          <Heart className={cn("w-5 h-5", inWishlist && "fill-rose-500")} />
        </button>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg">{recommendation.name}</h3>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="fill-amber-500 w-4 h-4" />
            <span className="text-sm">{recommendation.rating}</span>
          </div>
        </div>

        <div className="flex items-center text-muted-foreground mb-3 text-sm">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="truncate">{recommendation.address}</span>
        </div>

        {recommendation.openNow !== undefined && (
          <div className="flex items-center justify-between text-sm mb-3">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className={recommendation.openNow ? "text-emerald-600" : "text-rose-600"}>
                {recommendation.openNow ? "Open now" : "Closed"}
              </span>
              {recommendation.hours && (
                <span className="text-muted-foreground ml-1">
                  {recommendation.hours}
                </span>
              )}
            </div>
            <div className="text-muted-foreground">
              {recommendation.distance}
            </div>
          </div>
        )}

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {recommendation.description}
        </p>

        <div className="flex gap-2 mt-auto">
          {recommendation.priceLevel && (
            <span className="bg-secondary text-xs px-2 py-1 rounded-full text-muted-foreground">
              {recommendation.priceLevel}
            </span>
          )}
          {recommendation.tags.map((tag, index) => (
            <span 
              key={index} 
              className="bg-secondary text-xs px-2 py-1 rounded-full text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <Button 
            onClick={handleCall} 
            variant="outline" 
            size="sm" 
            className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
          >
            <Phone className="mr-1 h-4 w-4" />
            Call
          </Button>
          <Button 
            onClick={handleWhatsApp} 
            variant="outline" 
            size="sm" 
            className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
          >
            <MessageSquare className="mr-1 h-4 w-4" />
            Message
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationCard;
