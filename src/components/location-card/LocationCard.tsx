import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Heart, LogIn } from 'lucide-react';
import { Recommendation } from '@/lib/mockData';
import { useWishlist } from '@/contexts/WishlistContext';
import { supabase } from '@/integrations/supabase/client';
import ImageViewer from '@/components/ImageViewer';
import { useToast } from '@/hooks/use-toast';

// Import newly created components
import StarRating from './StarRating';
import LocationBadges from './LocationBadges';
import LocationImageCarousel from './LocationImageCarousel';
import LocationAvailability from './LocationAvailability';
import LocationActionButtons from './LocationActionButtons';
import LocationAddressInfo from './LocationAddressInfo';

interface LocationCardProps {
  recommendation: Recommendation;
  className?: string;
  ranking?: number;
  reviewCount?: number;
  showDistanceUnderAddress?: boolean;
  hideWishlistIcon?: boolean;
}

const LocationCard: React.FC<LocationCardProps> = ({
  recommendation,
  className,
  ranking,
  reviewCount = 0,
  showDistanceUnderAddress = false,
  hideWishlistIcon = false
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(recommendation.id, 'location');
  const [user, setUser] = useState<any>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const hiddenGemCount = recommendation.hiddenGemCount || 0;
  const mustVisitCount = recommendation.mustVisitCount || 0;
  const showHiddenGemBadge = recommendation.isHiddenGem || hiddenGemCount >= 20;
  const showMustVisitBadge = recommendation.isMustVisit || mustVisitCount >= 20;

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
      removeFromWishlist(recommendation.id, 'location');
    } else {
      addToWishlist({...recommendation, type: 'location'});
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

  const formatBusinessHours = (hours: string | undefined) => {
    if (!hours) {
      if (recommendation.availability_days && recommendation.availability_days.length > 0) {
        const days = recommendation.availability_days.join(', ');
        const startTime = recommendation.availability_start_time || '';
        const endTime = recommendation.availability_end_time || '';
        if (startTime && endTime) {
          return `${days}: ${startTime} - ${endTime}`;
        }
        return days;
      }
      return null;
    }
    if (recommendation.availability_days && recommendation.availability_days.length > 0) {
      const days = recommendation.availability_days.join(', ');
      const startTime = recommendation.availability_start_time || '';
      const endTime = recommendation.availability_end_time || '';
      if (startTime && endTime) {
        return `${days}: ${startTime} - ${endTime}`;
      }
      return days;
    }
    return hours;
  };

  const isOpenNow = () => {
    if (recommendation.openNow === true) return true;
    if (recommendation.openNow === false) return false;
    if (recommendation.availability_days && recommendation.availability_days.length > 0) {
      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', {
        weekday: 'long'
      }).toLowerCase();
      const availableDays = recommendation.availability_days?.map(day => day.toLowerCase()) || [];
      const isAvailableToday = availableDays.some(day => currentDay.includes(day) || day.includes(currentDay));
      if (!isAvailableToday) return false;
      if (recommendation.availability_start_time && recommendation.availability_end_time) {
        const startTime = parseTimeString(recommendation.availability_start_time);
        const endTime = parseTimeString(recommendation.availability_end_time);
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        return currentTimeInMinutes >= startTime && currentTimeInMinutes <= endTime;
      }
      return true;
    }
    if (recommendation.hours || recommendation.availability) {
      return true;
    }
    return undefined;
  };

  const parseTimeString = (timeString: string): number => {
    try {
      const [time, period] = timeString.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    } catch (e) {
      console.error("Error parsing time string:", timeString, e);
      return 0;
    }
  };

  const businessHours = formatBusinessHours(recommendation.hours || recommendation.availability);
  const isSearchResultCard = className?.includes('search-result-card');
  const isLocationDetailsPage = window.location.pathname.includes('/location/');
  const shouldIncreaseHeight = isSearchResultCard || isLocationDetailsPage;
  const imageHeightClass = shouldIncreaseHeight ? "h-[400px]" : "h-72";
  const openStatus = isOpenNow();

  return (
    <div 
      onClick={handleCardClick} 
      className={cn(
        "group bg-white rounded-xl border border-border/50 overflow-hidden transition-all-300 cursor-pointer", 
        "hover:shadow-lg hover:border-primary/20 hover:scale-[1.01]", 
        className
      )}
    >
      <LocationImageCarousel 
        images={images}
        name={recommendation.name}
        category={recommendation.category}
        imageHeightClass={imageHeightClass}
        shouldIncreaseHeight={shouldIncreaseHeight}
        onImageClick={handleImageClick}
      />
      
      <LocationBadges 
        showHiddenGemBadge={showHiddenGemBadge}
        showMustVisitBadge={showMustVisitBadge}
      />
      
      {!hideWishlistIcon && (
        <button 
          onClick={handleWishlistToggle} 
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all z-10", 
            user ? inWishlist ? "text-rose-500" : "text-muted-foreground hover:text-rose-500" : "text-muted-foreground"
          )}
        >
          {user ? <Heart className={cn("w-5 h-5", inWishlist && "fill-rose-500")} /> : <LogIn className="w-5 h-5" />}
        </button>
      )}

      <div className="p-4">
        <div className="flex justify-between items-start gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            {ranking !== undefined && ranking <= 10 && (
              <div className={cn("flex items-center justify-center rounded-full border-2 flex-shrink-0", getMedalStyle(ranking).medalClass)}>
                {ranking}
              </div>
            )}
            <h3 className="font-bold text-2xl">{recommendation.name}</h3>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-2">
          <StarRating rating={recommendation.rating} />
          <span className="text-xs text-muted-foreground ml-1">
            ({reviewCount})
          </span>
        </div>

        <LocationAddressInfo 
          address={recommendation.address}
          distance={recommendation.distance}
          instagram={recommendation.instagram}
          showDistanceUnderAddress={showDistanceUnderAddress}
        />

        <LocationAvailability 
          openStatus={openStatus}
          businessHours={businessHours}
          availabilityDays={recommendation.availability_days}
          availabilityStartTime={recommendation.availability_start_time}
          availabilityEndTime={recommendation.availability_end_time}
        />

        <p className="mb-4 line-clamp-2 font-normal text-slate-700 text-base leading-normal min-h-[3em]">
          {recommendation.description}
        </p>

        <LocationBadges
          showHiddenGemBadge={false}
          showMustVisitBadge={false}
          priceInfo={formatPrice()}
          tags={recommendation.tags}
        />

        <LocationActionButtons 
          name={recommendation.name}
          phone={recommendation.phone}
          address={recommendation.address}
          mapLink={recommendation.map_link}
          id={recommendation.id}
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
