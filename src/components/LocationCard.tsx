import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MapPin, Star, Clock, Phone, Heart, Navigation2, MessageCircle, Share2, LogIn, IndianRupee, Film, ChevronDown, Sparkles, Award, Circle, CircleDot, Calendar } from 'lucide-react';
import { Recommendation } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useWishlist } from '@/contexts/WishlistContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import ImageViewer from '@/components/ImageViewer';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  const [imageLoaded, setImageLoaded] = useState<boolean[]>([]);
  const {
    toast
  } = useToast();
  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  } = useWishlist();
  const inWishlist = isInWishlist(recommendation.id, 'location');
  const isMobile = useIsMobile();
  const [user, setUser] = useState<any>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const hiddenGemCount = recommendation.hiddenGemCount || 0;
  const mustVisitCount = recommendation.mustVisitCount || 0;
  const showHiddenGemBadge = recommendation.isHiddenGem || hiddenGemCount >= 20;
  const showMustVisitBadge = recommendation.isMustVisit || mustVisitCount >= 20;
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data
      } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    getCurrentUser();
    const {
      data: authListener
    } = supabase.auth.onAuthStateChange(async (event, session) => {
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
  const formatDistance = (distanceText: string | undefined) => {
    if (!distanceText) return '';
    const distanceMatch = distanceText.match(/(\d+(\.\d+)?)/);
    if (distanceMatch) {
      const distanceValue = parseFloat(distanceMatch[0]);
      return `${distanceValue.toFixed(1)} km away`;
    }
    let formattedDistance = distanceText.replace('miles', 'km');
    formattedDistance = formattedDistance.replace('away away', 'away');
    return formattedDistance;
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
    if (hasAvailabilityInfo()) {
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
  const hasAvailabilityInfo = () => {
    console.log("LocationCard - Checking availability for:", recommendation.name);
    console.log("LocationCard - availability_days:", recommendation.availability_days);
    return recommendation.availability_days && Array.isArray(recommendation.availability_days) && recommendation.availability_days.length > 0;
  };
  const hasInstagram = () => {
    console.log("LocationCard - Checking Instagram for:", recommendation.name);
    console.log("LocationCard - Instagram link:", recommendation.instagram);
    return recommendation.instagram && typeof recommendation.instagram === 'string' && recommendation.instagram.trim() !== '';
  };
  const formatAvailabilityDays = () => {
    if (!recommendation.availability_days || recommendation.availability_days.length === 0) {
      return null;
    }
    const formattedDays = formatDayRange(recommendation.availability_days);
    const startTime = recommendation.availability_start_time || '';
    const endTime = recommendation.availability_end_time || '';
    if (startTime && endTime) {
      return <div className="text-sm text-muted-foreground px-0">
          <p className="leading-none">{formattedDays}</p>
          <p className="leading-none mt-0">{startTime} - {endTime}</p>
        </div>;
    }
    return <div className="text-sm text-muted-foreground px-0">
        <p className="leading-none">{formattedDays}</p>
      </div>;
  };
  const formatDayRange = (days: string[]): string => {
    if (!days || days.length === 0) return '';
    const dayAbbreviations: Record<string, string> = {
      'monday': 'Mon',
      'tuesday': 'Tue',
      'wednesday': 'Wed',
      'thursday': 'Thu',
      'friday': 'Fri',
      'saturday': 'Sat',
      'sunday': 'Sun'
    };
    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const sortedDays = [...days].sort((a, b) => dayOrder.indexOf(a.toLowerCase()) - dayOrder.indexOf(b.toLowerCase()));
    const ranges: string[] = [];
    let rangeStart: string | null = null;
    let rangeEnd: string | null = null;
    for (let i = 0; i <= sortedDays.length; i++) {
      const day = i < sortedDays.length ? sortedDays[i].toLowerCase() : null;
      const prevDay = i > 0 ? sortedDays[i - 1].toLowerCase() : null;
      const isDayAfterPrev = day && prevDay && dayOrder.indexOf(day) === dayOrder.indexOf(prevDay) + 1;
      if (i === 0) {
        rangeStart = sortedDays[0];
        rangeEnd = sortedDays[0];
      } else if (isDayAfterPrev) {
        rangeEnd = sortedDays[i];
      } else if (rangeStart && rangeEnd) {
        if (rangeStart === rangeEnd) {
          ranges.push(dayAbbreviations[rangeStart.toLowerCase()] || rangeStart);
        } else {
          const startAbbr = dayAbbreviations[rangeStart.toLowerCase()] || rangeStart;
          const endAbbr = dayAbbreviations[rangeEnd.toLowerCase()] || rangeEnd;
          ranges.push(`${startAbbr}~${endAbbr}`);
        }
        if (day) {
          rangeStart = sortedDays[i];
          rangeEnd = sortedDays[i];
        } else {
          rangeStart = null;
          rangeEnd = null;
        }
      }
    }
    return ranges.join(', ');
  };
  const formatDayShort = (day: string): string => {
    const dayMap: Record<string, string> = {
      'monday': 'Mon',
      'tuesday': 'Tue',
      'wednesday': 'Wed',
      'thursday': 'Thu',
      'friday': 'Fri',
      'saturday': 'Sat',
      'sunday': 'Sun'
    };
    return dayMap[day.toLowerCase()] || day;
  };
  const formatTime = (time: string | undefined): string => {
    if (!time) return '';
    return time;
  };
  const getAvailabilityHoursDisplay = (): string => {
    if (recommendation.availability_start_time && recommendation.availability_end_time) {
      return `${formatTime(recommendation.availability_start_time)}-${formatTime(recommendation.availability_end_time)}`;
    }
    return businessHours || '';
  };
  const getAvailabilityDaysDisplay = (): React.ReactNode => {
    if (!recommendation.availability_days || recommendation.availability_days.length === 0) {
      return null;
    }
    return recommendation.availability_days.map(day => formatDayShort(day)).join(', ');
  };
  const openStatus = isOpenNow();
  const businessHours = formatBusinessHours(recommendation.hours || recommendation.availability);
  const availabilityInfo = formatAvailabilityDays();
  const isSearchResultCard = className?.includes('search-result-card');
  const isLocationDetailsPage = window.location.pathname.includes('/location/');
  const shouldIncreaseHeight = isSearchResultCard || isLocationDetailsPage;
  const imageHeightClass = shouldIncreaseHeight ? "h-[400px]" : "h-72";
  return <div onClick={handleCardClick} className={cn("group bg-white rounded-xl border border-border/50 overflow-hidden transition-all-300 cursor-pointer", "hover:shadow-lg hover:border-primary/20 hover:scale-[1.01]", className)}>
      <div className={cn("relative w-full overflow-hidden", imageHeightClass)}>
        <Carousel className="w-full h-full">
          <CarouselContent className="h-full">
            {images.map((img, index) => <CarouselItem key={index} className="h-full p-0">
                <div className={cn("absolute inset-0 bg-muted/30", imageLoaded[index] ? "opacity-0" : "opacity-100")} />
                <img src={img} alt={`${recommendation.name} - image ${index + 1}`} onLoad={() => handleImageLoad(index)} onClick={e => handleImageClick(index, e)} className={cn("w-full transition-all-500 cursor-pointer", imageHeightClass, shouldIncreaseHeight ? "object-cover" : "object-contain", imageLoaded[index] ? "opacity-100 blur-0" : "opacity-0 blur-sm")} />
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
        
        <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-2">
          {showHiddenGemBadge && <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/90 backdrop-blur-sm text-white flex items-center">
              <Sparkles className="h-3 w-3 mr-1" />
              Hidden Gem
            </span>}
          {showMustVisitBadge && <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-500/90 backdrop-blur-sm text-white flex items-center">
              <Award className="h-3 w-3 mr-1" />
              Must Visit
            </span>}
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
            <h3 className="font-bold text-2xl">{recommendation.name}</h3>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-2">
          {renderStarRating(recommendation.rating)}
          <span className="text-xs text-muted-foreground ml-1">
            ({reviewCount})
          </span>
        </div>

        <div className="flex flex-col mb-3">
          <div className="flex items-center justify-between text-muted-foreground text-sm">
            <div className="flex items-center mx-0">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{recommendation.address}</span>
            </div>
            {hasInstagram() && <button onClick={e => handleInstagramClick(e, recommendation.instagram, recommendation.name)} title="Watch video content" className="bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 rounded-full hover:shadow-md transition-all ml-2 p-1.5 py-[7px] mx-0 px-[25px]">
                <Film className="h-4 w-4 text-white" />
              </button>}
          </div>
          
          {recommendation.distance && showDistanceUnderAddress && <div className="text-muted-foreground text-sm pl-5 mt-1 flex items-center justify-between my-[3px] px-[2px]">
              <div className="flex items-center px-0 mx-0">
                <Navigation2 className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                {formatDistance(recommendation.distance)}
              </div>
            </div>}
        </div>

        {(recommendation.openNow !== undefined || recommendation.hours || recommendation.availability || hasAvailabilityInfo()) && <div className="flex flex-col text-sm mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {openStatus === true ? <CircleDot className="w-4 h-4 mr-1 flex-shrink-0 text-emerald-600 fill-emerald-600" /> : openStatus === false ? <Circle className="w-4 h-4 mr-1 flex-shrink-0 text-rose-600 fill-rose-600" /> : <Clock className="w-4 h-4 mr-1 flex-shrink-0" />}
                <span className={openStatus === true ? "text-emerald-600 font-medium" : openStatus === false ? "text-rose-600 font-medium" : "text-muted-foreground"}>
                  {openStatus === true ? "Open now" : openStatus === false ? "Closed" : "Hours available"}
                </span>
              </div>
              
              {(hasAvailabilityInfo() || businessHours) && <DropdownMenu>
                  <DropdownMenuTrigger className="ml-2 inline-flex items-center text-xs font-medium text-primary hover:text-primary/80 transition-colors rounded-md" onClick={e => e.stopPropagation()}>
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span className="underline text-base">Hours</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={5} className="bg-white w-48 p-2 shadow-md rounded-md border z-50">
                    {getAvailabilityDaysDisplay() && <div className="mb-1">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Days:</div>
                        <div className="text-sm">{getAvailabilityDaysDisplay()}</div>
                      </div>}
                    {getAvailabilityHoursDisplay() && <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Hours:</div>
                        <div className="text-sm">{getAvailabilityHoursDisplay()}</div>
                      </div>}
                  </DropdownMenuContent>
                </DropdownMenu>}
            </div>
            
            {hasAvailabilityInfo() && openStatus !== false && <Collapsible open={availabilityOpen} onOpenChange={setAvailabilityOpen} className="mt-0.5">
                <CollapsibleTrigger onClick={e => e.stopPropagation()} className="flex items-center text-xs font-medium text-muted-foreground hover:text-primary transition-colors px-1 py-0.5 border border-transparent hover:border-border/30 rounded-md">
                  Available days
                  <ChevronDown className={cn("h-3 w-3 ml-1 transition-transform", availabilityOpen ? "transform rotate-180" : "")} />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-0.5 mb-0.5 border-l border-muted pl-0.5">
                  {availabilityInfo}
                </CollapsibleContent>
              </Collapsible>}
            
            {recommendation.distance && !showDistanceUnderAddress && <div className="text-muted-foreground pl-5 mt-1 flex items-center">
                <Navigation2 className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                {formatDistance(recommendation.distance)}
              </div>}
          </div>}

        <ScrollArea className="min-h-[12em] max-h-[12em] mb-4">
          <p className="font-normal text-slate-700 text-base leading-normal">
            {recommendation.description}
          </p>
        </ScrollArea>

        <div className="flex gap-2 mt-4 flex-wrap">
          {formatPrice() && <Badge className="flex items-center gap-1 px-3 py-1.5 bg-[#c63e7b]">
              <IndianRupee className="h-3.5 w-3.5" />
              {formatPrice()}
            </Badge>}
          {recommendation.tags && recommendation.tags.map((tag, index) => <Badge key={index} className="bg-[#1EAEDB] text-white text-xs px-2 py-1 rounded-full">
              {tag}
            </Badge>)}
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={handleCall} className="flex-1 h-10 border border-emerald-200 transition-all flex items-center justify-center shadow-[0_5px_0px_0px_rgba(16,185,129,0.2)] hover:shadow-[0_3px_0px_0px_rgba(16,185,129,0.2)] active:shadow-none active:translate-y-[3px] bg-blue-600 hover:bg-blue-500 text-slate-50 rounded">
            <Phone className="h-5 w-5" />
          </button>
          <button onClick={handleWhatsApp} className="flex-1 h-10 border border-emerald-200 transition-all flex items-center justify-center shadow-[0_5px_0px_0px_rgba(16,185,129,0.2)] hover:shadow-[0_3px_0px_0px_rgba(16,185,129,0.2)] active:shadow-none active:translate-y-[3px] text-slate-50 bg-green-600 hover:bg-green-500 rounded">
            <MessageCircle className="h-5 w-5" />
          </button>
          <button onClick={handleDirections} className="flex-1 h-10 border border-emerald-200 transition-all flex items-center justify-center shadow-[0_5px_0px_0px_rgba(16,185,129,0.2)] hover:shadow-[0_3px_0px_0px_rgba(16,185,129,0.2)] active:shadow-none active:translate-y-[3px] text-slate-50 bg-amber-600 hover:bg-amber-500 rounded">
            <Navigation2 className="h-5 w-5" />
          </button>
          <button onClick={handleShare} className="flex-1 h-10 border border-emerald-200 transition-all flex items-center justify-center shadow-[0_5px_0px_0px_rgba(16,185,129,0.2)] hover:shadow-[0_3px_0px_0px_rgba(16,185,129,0.2)] active:shadow-none active:translate-y-[3px] text-slate-50 bg-purple-600 hover:bg-purple-500 rounded">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {images.length > 0 && <ImageViewer images={images} initialIndex={selectedImageIndex} open={imageViewerOpen} onOpenChange={setImageViewerOpen} />}
    </div>;
};
export default LocationCard;