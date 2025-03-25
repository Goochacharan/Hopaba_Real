
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MapPin, Star, Clock, Phone, Heart, Navigation2, MessageCircle, Share2, LogIn, IndianRupee, Film } from 'lucide-react';
import { Recommendation } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useWishlist } from '@/contexts/WishlistContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import ImageViewer from '@/components/ImageViewer';

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
  const [imageLoaded, setImageLoaded] = useState<boolean[]>([]);
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

  const images = recommendation.images && recommendation.images.length > 0 ? recommendation.images : [recommendation.image];
  React.useEffect(() => {
    setImageLoaded(Array(images.length).fill(false));
  }, [images.length]);

  const handleImageLoad = (index: number) => {
    setImageLoaded(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  const handleImageClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };

  const getMedalStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          medalClass: "bg-gradient-to-b from-yellow-300 to-yellow-500 border-yellow-300 text-yellow-900 shadow h-6 w-6 text-xs",
          ribbonColor: "bg-red-500"
        };
      case 2:
        return {
          medalClass: "bg-gradient-to-b from-gray-200 to-gray-400 border-gray-200 text-gray-800 shadow h-6 w-6 text-xs",
          ribbonColor: "bg-blue-500"
        };
      case 3:
        return {
          medalClass: "bg-gradient-to-b from-amber-300 to-amber-600 border-amber-300 text-amber-900 shadow h-6 w-6 text-xs",
          ribbonColor: "bg-green-500"
        };
      default:
        return {
          medalClass: "bg-gradient-to-b from-blue-400 to-blue-600 border-blue-300 text-white shadow h-6 w-6 text-xs",
          ribbonColor: "bg-blue-300"
        };
    }
  };

  const renderStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const totalStars = 5;
    return <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} className="fill-amber-500 stroke-amber-500 w-3.5 h-3.5" />)}
        
        {hasHalfStar && <div className="relative w-3.5 h-3.5">
            <Star className="absolute stroke-amber-500 w-3.5 h-3.5" />
            <div className="absolute overflow-hidden w-[50%]">
              <Star className="fill-amber-500 stroke-amber-500 w-3.5 h-3.5" />
            </div>
          </div>}
        
        {[...Array(totalStars - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => <Star key={`empty-${i}`} className="stroke-amber-500 w-3.5 h-3.5" />)}
      </div>;
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
    if (!recommendation.instagram) {
      toast({
        title: "No Instagram",
        description: `${recommendation.name} hasn't provided an Instagram profile`,
        duration: 2000
      });
      return;
    }
    let instagramHandle = recommendation.instagram;
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

    // Check if there's a Google Maps link available
    if (recommendation.map_link) {
      window.open(recommendation.map_link, '_blank');
      toast({
        title: "Opening Directions",
        description: `Opening Google Maps directions to ${recommendation.name}...`,
        duration: 2000
      });
      return;
    }
    
    // Fall back to normal address-based directions
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

  const formatDistance = (distanceText: string | undefined) => {
    if (!distanceText) return '';
    
    // Try to extract a numeric value from the distance text
    const distanceMatch = distanceText.match(/(\d+(\.\d+)?)/);
    if (distanceMatch) {
      const distanceValue = parseFloat(distanceMatch[0]);
      return `${distanceValue.toFixed(1)} km away`;
    }
    
    // If no numeric value is found, use the original text but convert to km
    let formattedDistance = distanceText.replace('miles', 'km');
    formattedDistance = formattedDistance.replace('away away', 'away');
    return formattedDistance;
  };

  return <div onClick={handleCardClick} className={cn("group bg-white rounded-xl border border-border/50 overflow-hidden transition-all-300 cursor-pointer", "hover:shadow-lg hover:border-primary/20 hover:scale-[1.01]", className)}>
      <div className={cn(
        "relative w-full overflow-hidden",
        className?.includes('search-result-card') ? "h-96" : "h-72"
      )}>
        <Carousel className="w-full h-full">
          <CarouselContent className="h-full">
            {images.map((img, index) => <CarouselItem key={index} className="h-full p-0">
                <div className={cn("absolute inset-0 bg-muted/30", imageLoaded[index] ? "opacity-0" : "opacity-100")} />
                <img 
                  src={img} 
                  alt={`${recommendation.name} - image ${index + 1}`} 
                  onLoad={() => handleImageLoad(index)} 
                  onClick={e => handleImageClick(index, e)} 
                  className={cn(
                    "w-full object-cover transition-all-500 cursor-pointer",
                    className?.includes('search-result-card') ? "h-96" : "h-72",
                    imageLoaded[index] ? "opacity-100 blur-0" : "opacity-0 blur-sm"
                  )}
                />
              </CarouselItem>)}
          </CarouselContent>
          {images.length > 1 && <>
              <CarouselPrevious className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2" />
              <CarouselNext className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2" />
            </>}
        </Carousel>

        <div className="absolute top-3 left-20 z-10">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-black/40 backdrop-blur-sm text-white">
            {recommendation.category}
          </span>
        </div>
        
        <button onClick={handleWishlistToggle} className={cn("absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all z-10", user ? inWishlist ? "text-rose-500" : "text-muted-foreground hover:text-rose-500" : "text-muted-foreground")}>
          {user ? <Heart className={cn("w-5 h-5", inWishlist && "fill-rose-500")} /> : <LogIn className="w-5 h-5" />}
        </button>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            {ranking !== undefined && ranking <= 10 && <div className={cn("flex items-center justify-center rounded-full border-2 flex-shrink-0", getMedalStyle(ranking).medalClass)}>
                {ranking}
              </div>}
            <h3 className="font-medium text-lg">{recommendation.name}</h3>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-2">
          {renderStarRating(recommendation.rating)}
          <span className="text-xs text-muted-foreground ml-1">
            ({reviewCount})
          </span>
        </div>

        <div className="flex flex-col mb-3">
          <div className="flex items-center text-muted-foreground text-sm">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{recommendation.address}</span>
          </div>
          
          {recommendation.distance && showDistanceUnderAddress && <div className="text-muted-foreground text-sm pl-5 mt-1 flex items-center my-[3px] px-0">
              <Navigation2 className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
              {formatDistance(recommendation.distance)}
            </div>}
        </div>

        {recommendation.openNow !== undefined && <div className="flex flex-col text-sm mb-3">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className={recommendation.openNow ? "text-emerald-600" : "text-rose-600"}>
                {recommendation.openNow ? "Open now" : "Closed"}
              </span>
              {recommendation.hours && <span className="text-muted-foreground ml-1">
                  {recommendation.hours}
                </span>}
              {recommendation.instagram && <button onClick={handleInstagram} title="Watch video content" className="bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 rounded-full hover:shadow-md transition-all ml-3 py-2 px-[26px] mx-[34px]">
                  <Film className="h-5 w-5 text-white" />
                </button>}
            </div>
            {recommendation.distance && !showDistanceUnderAddress && <div className="text-muted-foreground pl-5 mt-1 flex items-center">
                <Navigation2 className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                {formatDistance(recommendation.distance)}
              </div>}
          </div>}

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {recommendation.description}
        </p>

        <div className="flex gap-2 mt-4 flex-wrap">
          {recommendation.priceLevel && <span className="bg-[#1EAEDB] text-white text-xs px-2 py-1 rounded-full">
              {recommendation.priceLevel.replace(/\$/g, '₹')}
            </span>}
          {recommendation.tags.map((tag, index) => <span key={index} className="bg-[#1EAEDB] text-white text-xs px-2 py-1 rounded-full">
              {tag}
            </span>)}
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={handleCall} className="flex-1 h-10 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center">
            <Phone className="h-5 w-5" />
          </button>
          <button onClick={handleWhatsApp} className="flex-1 h-10 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center">
            <MessageCircle className="h-5 w-5" />
          </button>
          <button onClick={handleDirections} className="flex-1 h-10 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center">
            <Navigation2 className="h-5 w-5" />
          </button>
          <button onClick={handleShare} className="flex-1 h-10 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {images.length > 0 && <ImageViewer images={images} initialIndex={selectedImageIndex} open={imageViewerOpen} onOpenChange={setImageViewerOpen} />}
    </div>;
};

export default LocationCard;
