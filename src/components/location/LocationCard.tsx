
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Film, Heart, LogIn } from 'lucide-react';
import { Recommendation } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { useWishlist } from '@/contexts/WishlistContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import ImageViewer from '@/components/ImageViewer';
import StarRating from './StarRating';
import ImageCarousel from './ImageCarousel';
import LocationAvailability from './LocationAvailability';
import LocationMeta from './LocationMeta';
import ActionButtons from './ActionButtons';
import { formatDistance, checkOpenStatus } from './utils';

interface LocationCardProps {
  recommendation: Recommendation;
  className?: string;
  ranking?: number;
  reviewCount?: number;
  showDistanceUnderAddress?: boolean;
}

const LocationCard: React.FC<LocationCardProps> = ({
  recommendation,
  className,
  ranking,
  reviewCount = Math.floor(Math.random() * 300) + 50,
  showDistanceUnderAddress = false
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(recommendation.id);
  const isMobile = useIsMobile();
  const [user, setUser] = useState<any>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    getCurrentUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const images = recommendation.images && recommendation.images.length > 0 
    ? recommendation.images 
    : [recommendation.image];

  const hasAvailabilityInfo = () => {
    return recommendation.availability_days && 
           Array.isArray(recommendation.availability_days) && 
           recommendation.availability_days.length > 0;
  };

  const hasInstagram = () => {
    return recommendation.instagram && 
           typeof recommendation.instagram === 'string' && 
           recommendation.instagram.trim() !== '';
  };

  const handleImageClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };

  const getMedalStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-b from-yellow-300 to-yellow-500 border-yellow-300 text-yellow-900 shadow h-6 w-6 text-xs";
      case 2:
        return "bg-gradient-to-b from-gray-200 to-gray-400 border-gray-200 text-gray-800 shadow h-6 w-6 text-xs";
      case 3:
        return "bg-gradient-to-b from-amber-300 to-amber-600 border-amber-300 text-amber-900 shadow h-6 w-6 text-xs";
      default:
        return "bg-gradient-to-b from-blue-400 to-blue-600 border-blue-300 text-white shadow h-6 w-6 text-xs";
    }
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Calling",
      description: `Calling ${recommendation.name}...`,
      duration: 3000
    });
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phoneNumber = recommendation.phone || '';
    const message = encodeURIComponent(`Hi, I'm interested in ${recommendation.name}`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    toast({
      title: "Opening WhatsApp",
      description: `Messaging ${recommendation.name} via WhatsApp...`,
      duration: 3000
    });
  };

  const handleInstagram = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!hasInstagram()) {
      toast({
        title: "No Instagram",
        description: `${recommendation.name} hasn't provided an Instagram profile`,
        duration: 2000
      });
      return;
    }
    
    let instagramHandle = recommendation.instagram || '';
    if (instagramHandle.startsWith('@')) {
      instagramHandle = instagramHandle.substring(1);
    }
    
    window.open(`instagram://user?username=${instagramHandle}`);
    setTimeout(() => {
      window.open(`https://instagram.com/${instagramHandle}`);
    }, 300);
    
    toast({
      title: "Opening Instagram",
      description: `Opening Instagram for ${recommendation.name}...`,
      duration: 2000
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to your wishlist",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    if (inWishlist) {
      removeFromWishlist(recommendation.id);
      toast({
        title: "Removed from wishlist",
        description: `${recommendation.name} removed from your wishlist`,
        duration: 2000
      });
    } else {
      addToWishlist(recommendation, 'recommendation');
      toast({
        title: "Added to wishlist",
        description: `${recommendation.name} added to your wishlist`,
        duration: 2000
      });
    }
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (recommendation.map_link && recommendation.map_link.trim() !== '') {
      window.open(recommendation.map_link, '_blank');
      toast({
        title: "Opening Directions",
        description: `Opening Google Maps directions to ${recommendation.name}...`,
        duration: 2000
      });
      return;
    }
    
    const destination = encodeURIComponent(recommendation.address);
    let mapsUrl;
    if (isMobile && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      mapsUrl = `maps://maps.apple.com/?q=${destination}`;
    } else {
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${destination}`;
    }
    window.open(mapsUrl, '_blank');
    toast({
      title: "Opening Directions",
      description: `Getting directions to ${recommendation.name}...`,
      duration: 2000
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: recommendation.name,
        text: `Check out ${recommendation.name}`,
        url: window.location.origin + `/location/${recommendation.id}`
      }).then(() => {
        toast({
          title: "Shared successfully",
          description: `You've shared ${recommendation.name}`,
          duration: 2000
        });
      }).catch(error => {
        console.error('Error sharing:', error);
        toast({
          title: "Sharing failed",
          description: "Could not share this location",
          variant: "destructive",
          duration: 2000
        });
      });
    } else {
      const shareUrl = window.location.origin + `/location/${recommendation.id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast({
          title: "Link copied",
          description: "The link has been copied to your clipboard",
          duration: 2000
        });
      });
    }
  };

  const handleCardClick = () => {
    navigate(`/location/${recommendation.id}`);
  };

  const formatPrice = () => {
    if (recommendation.price_range_min && recommendation.price_range_max && recommendation.price_unit) {
      return `${recommendation.price_range_min}-${recommendation.price_range_max}/${recommendation.price_unit.replace('per ', '')}`;
    } else if (recommendation.priceLevel) {
      return recommendation.priceLevel;
    } else if (recommendation.price_level) {
      return recommendation.price_level;
    }
    return '';
  };

  const openStatus = checkOpenStatus(
    recommendation.availability_days,
    recommendation.availability_start_time,
    recommendation.availability_end_time,
    recommendation.openNow,
    Boolean(recommendation.hours || recommendation.availability)
  );

  console.log("LocationCard - Instagram:", recommendation.instagram);
  console.log("LocationCard - Availability days:", recommendation.availability_days);
  console.log("LocationCard - hasAvailabilityInfo:", hasAvailabilityInfo());
  console.log("LocationCard - hasInstagram:", hasInstagram());
  console.log("LocationCard - Open now status:", openStatus);

  return (
    <div 
      onClick={handleCardClick} 
      className={cn(
        "group bg-white rounded-xl border border-border/50 overflow-hidden transition-all-300 cursor-pointer", 
        "hover:shadow-lg hover:border-primary/20 hover:scale-[1.01]", 
        className
      )}
    >
      {/* Image carousel section */}
      <div className={cn(
        "relative", 
        className?.includes('search-result-card') ? "h-96" : "h-72"
      )}>
        <ImageCarousel 
          images={images} 
          onImageClick={handleImageClick} 
          className={className?.includes('search-result-card') ? "h-96" : "h-72"}
        />

        <div className="absolute top-3 left-20 z-10">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-black/40 backdrop-blur-sm text-white">
            {recommendation.category}
          </span>
        </div>
        
        <button 
          onClick={handleWishlistToggle} 
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all z-10", 
            user ? inWishlist ? "text-rose-500" : "text-muted-foreground hover:text-rose-500" : "text-muted-foreground"
          )}
        >
          {user ? <Heart className={cn("w-5 h-5", inWishlist && "fill-rose-500")} /> : <LogIn className="w-5 h-5" />}
        </button>
      </div>

      <div className="p-4">
        {/* Title and rank */}
        <div className="flex justify-between items-start gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            {ranking !== undefined && ranking <= 10 && (
              <div className={cn(
                "flex items-center justify-center rounded-full border-2 flex-shrink-0", 
                getMedalStyle(ranking)
              )}>
                {ranking}
              </div>
            )}
            <h3 className="font-medium text-lg">{recommendation.name}</h3>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <StarRating rating={recommendation.rating} />
          <span className="text-xs text-muted-foreground ml-1">
            ({reviewCount})
          </span>
        </div>

        {/* Location meta information */}
        <LocationMeta 
          address={recommendation.address}
          distance={recommendation.distance}
          showDistanceUnderAddress={showDistanceUnderAddress}
          priceRange={formatPrice()}
          tags={recommendation.tags}
          formatDistance={formatDistance}
        />

        {/* Hours and availability */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <LocationAvailability 
              openStatus={openStatus}
              availabilityDays={recommendation.availability_days}
              startTime={recommendation.availability_start_time}
              endTime={recommendation.availability_end_time}
            />
            
            {hasInstagram() && (
              <button 
                onClick={handleInstagram} 
                title="Watch Instagram content" 
                className="bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 rounded-full hover:shadow-md transition-all ml-3 p-1.5"
              >
                <Film className="h-4 w-4 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Instagram only section when no availability info */}
        {(!recommendation.openNow && !recommendation.hours && !recommendation.availability && 
          !hasAvailabilityInfo()) && 
          hasInstagram() && (
          <div className="flex items-center mb-3">
            <button 
              onClick={handleInstagram} 
              title="Watch Instagram content" 
              className="bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 rounded-full hover:shadow-md transition-all p-1.5"
            >
              <Film className="h-4 w-4 text-white" />
            </button>
            <span className="ml-2 text-xs text-muted-foreground">Instagram content</span>
          </div>
        )}

        {/* Description */}
        <p className="mb-4 line-clamp-2 text-slate-950 font-normal text-base">
          {recommendation.description}
        </p>

        {/* Action buttons */}
        <ActionButtons 
          onCall={handleCall}
          onWhatsApp={handleWhatsApp}
          onDirections={handleDirections}
          onShare={handleShare}
        />
      </div>

      {images.length > 0 && (
        <ImageViewer 
          images={images} 
          initialIndex={selectedImageIndex} 
          open={imageViewerOpen} 
          onOpenChange={setImageViewerOpen} 
        />
      )}
    </div>
  );
};

export default LocationCard;
