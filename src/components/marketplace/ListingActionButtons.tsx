
import React from 'react';
import { Phone, MessageSquare, MapPin, Film, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface ListingActionButtonsProps {
  listingId: string;
  title: string;
  price: number;
  sellerPhone: string | null;
  sellerWhatsapp: string | null;
  sellerInstagram: string | null;
  location: string;
}

const ListingActionButtons: React.FC<ListingActionButtonsProps> = ({
  listingId,
  title,
  price,
  sellerPhone,
  sellerWhatsapp,
  sellerInstagram,
  location,
}) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const formatPrice = (price: number): string => {
    return '₹' + price.toLocaleString('en-IN');
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `Check out this ${title} for ${formatPrice(price)}`,
        url: window.location.origin + `/marketplace/${listingId}`,
      }).catch(error => {
        console.log('Error sharing', error);
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/marketplace/${listingId}`);
      toast({
        title: "Link copied to clipboard",
        description: "You can now share this listing with others",
        duration: 3000,
      });
    }
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sellerPhone) {
      window.location.href = `tel:${sellerPhone}`;
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
    if (sellerWhatsapp) {
      const message = `Hi, I'm interested in your listing "${title}" for ${formatPrice(price)}. Is it still available?`;
      window.open(`https://wa.me/${sellerWhatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`);
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
    if (sellerInstagram) {
      window.open(sellerInstagram);
      toast({
        title: "Opening video content",
        description: "Visiting video content...",
        duration: 2000,
      });
    } else {
      toast({
        title: "Video content not available",
        description: "The seller has not provided any video links",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleLocation = (e: React.MouseEvent) => {
    e.stopPropagation();
    let mapsUrl;
    
    if (location.includes('google.com/maps') || location.includes('goo.gl/maps')) {
      mapsUrl = location;
    } else {
      const destination = encodeURIComponent(location);
      
      if (isMobile && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        mapsUrl = `maps://maps.apple.com/?q=${destination}`;
      } else {
        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${destination}`;
      }
    }
    
    window.open(mapsUrl, '_blank');
    
    toast({
      title: "Opening Directions",
      description: `Getting directions to ${location}...`,
      duration: 2000,
    });
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3 mt-auto">
        <button 
          onClick={handleCall}
          className="h-12 rounded-full bg-[#1EAEDB] text-white hover:bg-[#1EAEDB]/90 transition-colors flex items-center justify-center gap-2"
          title="Call"
          aria-label="Call seller"
        >
          <Phone className="h-5 w-5 shrink-0" />
          <span className="text-sm whitespace-nowrap">Contact Seller</span>
        </button>
        <button 
          onClick={handleWhatsApp}
          className="h-12 rounded-full border border-[#1EAEDB]/20 bg-[#1EAEDB]/5 text-[#1EAEDB] hover:bg-[#1EAEDB]/10 transition-colors flex items-center justify-center gap-2"
          title="WhatsApp"
          aria-label="Contact on WhatsApp"
        >
          <MessageSquare className="h-5 w-5 shrink-0" />
          <span className="text-sm whitespace-nowrap">WhatsApp</span>
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
        {sellerInstagram && (
          <button 
            onClick={handleInstagram}
            className="h-12 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 text-white hover:opacity-90 transition-colors flex items-center justify-center"
            title="Video content"
            aria-label="Watch video content"
          >
            <Film className="h-5 w-5" />
          </button>
        )}
        <button 
          onClick={handleShare}
          className="h-12 rounded-full border border-[#1EAEDB]/20 bg-[#1EAEDB]/5 text-[#1EAEDB] hover:bg-[#1EAEDB]/10 transition-colors flex items-center justify-center"
          title="Share"
          aria-label="Share listing"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>
    </>
  );
};

export default ListingActionButtons;
