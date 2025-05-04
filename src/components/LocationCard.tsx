
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MapPin, Film } from 'lucide-react';
import { Recommendation } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { useWishlist } from '@/contexts/WishlistContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import CommunityContributors from './CommunityContributors';
import RatingProgressBars from '@/components/RatingProgressBars';
import ImageViewer from '@/components/ImageViewer';
import LocationImageCarousel from './location/LocationImageCarousel';
import LocationBadges from './location/LocationBadges';
import StarRating from './location/StarRating';
import LocationActionButtons from './location/LocationActionButtons';
import LocationAvailability from './location/LocationAvailability';
import CategoryBadge from './location/CategoryBadge';
import WishlistButton from './location/WishlistButton';
import LocationTags from './location/LocationTags';
import VideoButton from './location/VideoButton';
import {
  calculateOpenStatus,
  formatBusinessHours,
  formatPrice,
  getMedalStyle,
  hasAvailabilityInfo,
  hasInstagram,
  getAvailabilityDaysDisplay,
  getAvailabilityHoursDisplay,
  formatDistanceText
} from '@/utils/locationCardUtils';

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
  reviewCount = 0,
  showDistanceUnderAddress = false
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(recommendation.id, 'location');
  const isMobile = useIsMobile();
  const [user, setUser] = useState<any>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [contributors, setContributors] = useState<any[]>([]);
  const [notesCount, setNotesCount] = useState(0);
  
  const hiddenGemCount = recommendation.hiddenGemCount || 0;
  const mustVisitCount = recommendation.mustVisitCount || 0;
  const showHiddenGemBadge = recommendation.isHiddenGem || hiddenGemCount >= 20;
  const showMustVisitBadge = recommendation.isMustVisit || mustVisitCount >= 20;
  
  const isSearchPage = window.location.pathname.includes('/search');
  const isLocationDetailsPage = window.location.pathname.includes('/location/');
  const shouldIncreaseHeight = isSearchPage || isLocationDetailsPage;
  const imageHeightClass = shouldIncreaseHeight ? "h-[400px]" : "h-72";
  
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
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);
  
  const fetchCommunityNotes = async () => {
    try {
      const { data: notes, error, count } = await supabase
        .from('community_notes')
        .select('id, user_id', { count: 'exact' })
        .eq('location_id', recommendation.id)
        .limit(8);
        
      if (error) throw error;
      
      if (notes) {
        setContributors(notes);
        setNotesCount(count || 0);
      }
    } catch (error) {
      console.error('Error fetching community notes:', error);
    }
  };
  
  useEffect(() => {
    if (recommendation.id) {
      fetchCommunityNotes();
    }
  }, [recommendation.id]);
  
  const images = recommendation.images && recommendation.images.length > 0 
    ? recommendation.images 
    : [recommendation.image];
  
  const businessHours = formatBusinessHours(recommendation.hours || recommendation.availability, recommendation);
  
  const handleImageClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
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
  
  const handleInstagramClick = (e: React.MouseEvent, instagram: string | undefined, businessName: string) => {
    e.stopPropagation();
    if (instagram) {
      window.open(instagram, '_blank', 'noopener,noreferrer');
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
      addToWishlist({
        ...recommendation,
        type: 'location'
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
  
  return (
    <div 
      onClick={handleCardClick} 
      className={cn(
        "group bg-white rounded-xl border border-border/50 overflow-hidden transition-all-300 cursor-pointer", 
        "hover:shadow-lg hover:border-primary/20 hover:scale-[1.01]", 
        className
      )}
    >
      <div className={cn("relative w-full overflow-hidden", imageHeightClass)}>
        <LocationImageCarousel 
          images={images} 
          onImageClick={handleImageClick} 
          heightClass={imageHeightClass} 
          shouldIncreaseHeight={shouldIncreaseHeight} 
        />
        
        <CategoryBadge category={recommendation.category} />
        
        <LocationBadges 
          showHiddenGemBadge={showHiddenGemBadge} 
          showMustVisitBadge={showMustVisitBadge} 
        />
        
        <WishlistButton 
          user={user} 
          inWishlist={inWishlist} 
          onClick={handleWishlistToggle} 
        />
      </div>

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
          <StarRating rating={recommendation.rating} reviewCount={reviewCount} />
        </div>

        <div className="flex flex-col mb-3">
          <div className="flex items-center justify-between text-muted-foreground text-sm">
            <div className="flex items-center mx-0">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{recommendation.address}</span>
            </div>
            
            <VideoButton 
              hasInstagram={hasInstagram(recommendation)} 
              instagram={recommendation.instagram} 
              businessName={recommendation.name}
              onInstagramClick={handleInstagramClick}
            />
          </div>
        </div>

        <div className="flex flex-col text-sm mb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <LocationAvailability 
                hasAvailabilityInfo={hasAvailabilityInfo(recommendation)} 
                businessHours={businessHours} 
                daysDisplay={getAvailabilityDaysDisplay(recommendation)}
                hoursDisplay={getAvailabilityHoursDisplay(recommendation, businessHours || '')}
              />

              {notesCount > 0 && (
                <CommunityContributors 
                  contributors={contributors} 
                  total={notesCount} 
                  locationId={recommendation.id} 
                />
              )}
            </div>
          </div>
        </div>

        <RatingProgressBars criteriaRatings={recommendation.criteriaRatings || {}} locationId={recommendation.id} />

        <ScrollArea className="h-[120px] mb-4">
          <p className="font-normal text-slate-700 leading-normal text-sm line-clamp-6">
            {recommendation.description}
          </p>
        </ScrollArea>

        <LocationTags 
          price={formatPrice(recommendation)} 
          tags={recommendation.tags} 
        />

        <LocationActionButtons 
          onCall={handleCall}
          onWhatsApp={handleWhatsApp}
          onDirections={handleDirections}
          onShare={handleShare}
        />
      </div>
      
      {imageViewerOpen && (
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
