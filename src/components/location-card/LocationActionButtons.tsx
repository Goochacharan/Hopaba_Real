
import React from 'react';
import { Phone, MessageCircle, Navigation2, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface LocationActionButtonsProps {
  name: string;
  phone?: string;
  address: string;
  mapLink?: string;
  id: string;
}

const LocationActionButtons: React.FC<LocationActionButtonsProps> = ({
  name,
  phone,
  address,
  mapLink,
  id
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Calling",
      description: `Calling ${name}...`,
      duration: 3000
    });
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phoneNumber = phone || '';
    const message = encodeURIComponent(`Hi, I'm interested in ${name}`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    toast({
      title: "Opening WhatsApp",
      description: `Messaging ${name} via WhatsApp...`,
      duration: 3000
    });
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapLink && mapLink.trim() !== '') {
      window.open(mapLink, '_blank');
      toast({
        title: "Opening Directions",
        description: `Opening Google Maps directions to ${name}...`,
        duration: 2000
      });
      return;
    }
    const destination = encodeURIComponent(address);
    let mapsUrl;
    if (isMobile && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      mapsUrl = `maps://maps.apple.com/?q=${destination}`;
    } else {
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${destination}`;
    }
    window.open(mapsUrl, '_blank');
    toast({
      title: "Opening Directions",
      description: `Getting directions to ${name}...`,
      duration: 2000
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: name,
        text: `Check out ${name}`,
        url: window.location.origin + `/location/${id}`
      }).then(() => {
        toast({
          title: "Shared successfully",
          description: `You've shared ${name}`,
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
      const shareUrl = window.location.origin + `/location/${id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast({
          title: "Link copied",
          description: "The link has been copied to your clipboard",
          duration: 2000
        });
      });
    }
  };

  return (
    <div className="flex gap-2 mt-4">
      <button 
        onClick={handleCall} 
        className="flex-1 h-10 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 transition-all flex items-center justify-center shadow-[0_5px_0px_0px_rgba(16,185,129,0.2)] hover:shadow-[0_3px_0px_0px_rgba(16,185,129,0.2)] active:shadow-none active:translate-y-[3px]"
      >
        <Phone className="h-5 w-5" />
      </button>
      <button 
        onClick={handleWhatsApp} 
        className="flex-1 h-10 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 transition-all flex items-center justify-center shadow-[0_5px_0px_0px_rgba(16,185,129,0.2)] hover:shadow-[0_3px_0px_0px_rgba(16,185,129,0.2)] active:shadow-none active:translate-y-[3px]"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
      <button 
        onClick={handleDirections} 
        className="flex-1 h-10 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 transition-all flex items-center justify-center shadow-[0_5px_0px_0px_rgba(16,185,129,0.2)] hover:shadow-[0_3px_0px_0px_rgba(16,185,129,0.2)] active:shadow-none active:translate-y-[3px]"
      >
        <Navigation2 className="h-5 w-5" />
      </button>
      <button 
        onClick={handleShare} 
        className="flex-1 h-10 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 transition-all flex items-center justify-center shadow-[0_5px_0px_0px_rgba(16,185,129,0.2)] hover:shadow-[0_3px_0px_0px_rgba(16,185,129,0.2)] active:shadow-none active:translate-y-[3px]"
      >
        <Share2 className="h-5 w-5" />
      </button>
    </div>
  );
};

export default LocationActionButtons;
