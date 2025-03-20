
import React from 'react';
import { Phone, MessageSquare, MapPin, Share2 } from 'lucide-react';
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
    
    const shareUrl = window.location.origin + `/marketplace/${listingId}`;
    const shareTitle = title;
    const shareText = `Check out this ${title} for ${formatPrice(price)}`;
    
    // Try to use the Web Share API first
    if (navigator.share) {
      try {
        navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
        .then(() => {
          toast({
            title: "Shared successfully",
            description: `You've shared ${title}`,
            duration: 2000,
          });
        })
        .catch((error) => {
          console.error('Error sharing:', error);
          // Fall back to clipboard if share API fails
          fallbackToClipboard();
        });
      } catch (error) {
        console.error('Error in share API:', error);
        fallbackToClipboard();
      }
    } else {
      fallbackToClipboard();
    }
    
    function fallbackToClipboard() {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          toast({
            title: "Link copied to clipboard",
            description: "You can now share this listing with others",
            duration: 3000,
          });
        })
        .catch(error => {
          console.error('Failed to copy:', error);
          toast({
            title: "Unable to share",
            description: "Please try again later",
            variant: "destructive",
            duration: 3000,
          });
        });
    }
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sellerPhone) {
      // Instead of changing window.location which might not work in some environments,
      // create a temporary link element and click it
      const link = document.createElement('a');
      link.href = `tel:${sellerPhone}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Calling seller",
        description: `Dialing ${sellerPhone}...`,
        duration: 2000,
      });
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
      const whatsappUrl = `https://wa.me/${sellerWhatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      
      // Use the safer approach with a temporary link
      const link = document.createElement('a');
      link.href = whatsappUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Opening WhatsApp",
        description: "Starting WhatsApp conversation...",
        duration: 2000,
      });
    } else {
      toast({
        title: "WhatsApp not available",
        description: "The seller has not provided a WhatsApp number",
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
    
    // Use the safer approach with a temporary link
    const link = document.createElement('a');
    link.href = mapsUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
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
      
      <div className="grid grid-cols-2 gap-2 mt-3">
        <button 
          onClick={handleLocation}
          className="h-12 rounded-full border border-[#1EAEDB]/20 bg-[#1EAEDB]/5 text-[#1EAEDB] hover:bg-[#1EAEDB]/10 transition-colors flex items-center justify-center"
          title="Location"
          aria-label="View location"
        >
          <MapPin className="h-5 w-5" />
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
    </>
  );
};

export default ListingActionButtons;
