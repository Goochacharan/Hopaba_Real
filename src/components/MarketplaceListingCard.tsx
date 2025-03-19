
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, MessageSquare, MapPin, Instagram, Share2, Star, Navigation2, Heart, Calendar, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import ImageViewer from '@/components/ImageViewer';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface MarketplaceListingCardProps {
  listing: MarketplaceListing;
  className?: string;
}

const formatPrice = (price: number): string => {
  return '₹' + price.toLocaleString('en-IN');
};

const MarketplaceListingCard: React.FC<MarketplaceListingCardProps> = ({ listing, className }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [imageLoaded, setImageLoaded] = React.useState<boolean[]>([]);
  const [inWishlist, setInWishlist] = React.useState(false);
  const [imageViewerOpen, setImageViewerOpen] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  
  React.useEffect(() => {
    setImageLoaded(Array(listing.images.length).fill(false));
  }, [listing.images.length]);

  const handleImageLoad = (index: number) => {
    setImageLoaded(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  const handleImageClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Check out this ${listing.title} for ${formatPrice(listing.price)}`,
        url: window.location.origin + `/marketplace/${listing.id}`,
      }).catch(error => {
        console.log('Error sharing', error);
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/marketplace/${listing.id}`);
      toast({
        title: "Link copied to clipboard",
        description: "You can now share this listing with others",
        duration: 3000,
      });
    }
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (listing.seller_phone) {
      window.location.href = `tel:${listing.seller_phone}`;
    } else {
      toast({
        title: "Phone number not available",
        description: "The seller has not provided a phone number",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (listing.seller_whatsapp) {
      const message = `Hi, I'm interested in your listing "${listing.title}" for ${formatPrice(listing.price)}. Is it still available?`;
      window.open(`https://wa.me/${listing.seller_whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`);
    } else {
      toast({
        title: "WhatsApp not available",
        description: "The seller has not provided a WhatsApp number",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleInstagram = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (listing.seller_instagram) {
      window.open(`https://instagram.com/${listing.seller_instagram}`);
    } else {
      toast({
        title: "Instagram not available",
        description: "The seller has not provided an Instagram handle",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleLocation = (e: React.MouseEvent) => {
    e.stopPropagation();
    const destination = encodeURIComponent(listing.location);
    let mapsUrl;

    if (isMobile && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      mapsUrl = `maps://maps.apple.com/?q=${destination}`;
    } else {
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${destination}`;
    }
    
    window.open(mapsUrl, '_blank');
    
    toast({
      title: "Opening Directions",
      description: `Getting directions to ${listing.location}...`,
      duration: 2000,
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInWishlist(!inWishlist);
    
    toast({
      title: inWishlist ? "Removed from wishlist" : "Added to wishlist",
      description: `${listing.title} ${inWishlist ? "removed from" : "added to"} your wishlist`,
      duration: 2000,
    });
  };

  const handleCardClick = () => {
    navigate(`/marketplace/${listing.id}`);
  };

  const renderStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const totalStars = 5;
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="fill-amber-500 stroke-amber-500 w-3.5 h-3.5" />
        ))}
        
        {hasHalfStar && (
          <div className="relative w-3.5 h-3.5">
            <Star className="absolute stroke-amber-500 w-3.5 h-3.5" />
            <div className="absolute overflow-hidden w-[50%]">
              <Star className="fill-amber-500 stroke-amber-500 w-3.5 h-3.5" />
            </div>
          </div>
        )}
        
        {[...Array(totalStars - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Star key={`empty-${i}`} className="stroke-amber-500 w-3.5 h-3.5" />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div 
      onClick={handleCardClick}
      className={cn(
        "group bg-white rounded-xl border border-border/50 overflow-hidden transition-all cursor-pointer",
        "hover:shadow-lg hover:border-primary/20 hover:scale-[1.01]",
        className
      )}
    >
      <div className="relative w-full overflow-hidden">
        <Carousel className="w-full">
          <CarouselContent>
            {listing.images.map((img, index) => (
              <CarouselItem key={index} className="p-0">
                <div 
                  className="relative w-full"
                  onClick={(e) => handleImageClick(e, index)}
                >
                  <AspectRatio ratio={4/3}>
                    <div className={cn(
                      "absolute inset-0 bg-muted/30",
                      imageLoaded[index] ? "opacity-0" : "opacity-100"
                    )} />
                    <img
                      src={img || '/placeholder.svg'} 
                      alt={`${listing.title} - image ${index + 1}`}
                      onLoad={() => handleImageLoad(index)}
                      className={cn(
                        "w-full h-full object-cover transition-all",
                        imageLoaded[index] ? "opacity-100 blur-0" : "opacity-0 blur-sm"
                      )}
                    />
                  </AspectRatio>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {listing.images.length > 1 && (
            <>
              <CarouselPrevious className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2" />
              <CarouselNext className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2" />
            </>
          )}
        </Carousel>
        
        <button 
          onClick={handleWishlistToggle}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all z-10",
            inWishlist ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"
          )}
        >
          <Heart className={cn("w-5 h-5", inWishlist && "fill-rose-500")} />
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-lg md:text-xl mb-2">{listing.title}</h3>
        
        <div className="flex items-center text-muted-foreground mb-2 text-sm">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="truncate">{listing.location}</span>
        </div>
        
        <div className="flex items-center text-muted-foreground mb-2 text-sm">
          <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
          <span>Listed on {formatDate(listing.created_at)}</span>
        </div>
        
        <div className="flex items-center mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 flex items-center">
            <Check className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
            {listing.condition}
          </span>
        </div>

        <div className="flex justify-between items-start mb-4">
          <p className="text-xl font-bold text-[#1EAEDB]">{formatPrice(listing.price)}</p>
          
          <div className="flex flex-col items-end">
            <span className="font-medium">{listing.seller_name}</span>
            <div className="flex items-center gap-1">
              {renderStarRating(listing.seller_rating)}
              <span className="text-xs text-muted-foreground ml-1">
                (24)
              </span>
            </div>
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {listing.description}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-auto">
          <button 
            onClick={handleCall}
            className="h-12 rounded-full bg-[#1EAEDB] text-white hover:bg-[#1EAEDB]/90 transition-colors flex items-center justify-center gap-2"
            title="Call"
            aria-label="Call seller"
          >
            <Phone className="h-5 w-5" />
            <span>Contact Seller</span>
          </button>
          <button 
            onClick={handleWhatsApp}
            className="h-12 rounded-full border border-[#1EAEDB]/20 bg-[#1EAEDB]/5 text-[#1EAEDB] hover:bg-[#1EAEDB]/10 transition-colors flex items-center justify-center gap-2"
            title="WhatsApp"
            aria-label="Contact on WhatsApp"
          >
            <MessageSquare className="h-5 w-5" />
            <span>WhatsApp</span>
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-3">
          <button 
            onClick={handleLocation}
            className="h-12 rounded-full border border-[#1EAEDB]/20 bg-[#1EAEDB]/5 text-[#1EAEDB] hover:bg-[#1EAEDB]/10 transition-colors flex items-center justify-center"
            title="Location"
            aria-label="View location"
          >
            <MapPin className="h-5 w-5" />
          </button>
          <button 
            onClick={handleInstagram}
            className="h-12 rounded-full border border-[#1EAEDB]/20 bg-[#1EAEDB]/5 text-[#1EAEDB] hover:bg-[#1EAEDB]/10 transition-colors flex items-center justify-center"
            title="Instagram"
            aria-label="View Instagram profile"
          >
            <Instagram className="h-5 w-5" />
          </button>
          <button 
            onClick={handleShare}
            className="h-12 rounded-full border border-[#1EAEDB]/20 bg-[#1EAEDB]/5 text-[#1EAEDB] hover:bg-[#1EAEDB]/10 transition-colors flex items-center justify-center"
            title="Share"
            aria-label="Share listing"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <ImageViewer 
        images={listing.images} 
        initialIndex={selectedImageIndex}
        open={imageViewerOpen}
        onOpenChange={setImageViewerOpen}
      />
    </div>
  );
};

export default MarketplaceListingCard;
