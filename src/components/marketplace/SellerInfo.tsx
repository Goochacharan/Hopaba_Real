
import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { Instagram, Film, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SellerInfoProps {
  sellerName: string;
  sellerRating: number;
  reviewCount?: number;
  sellerInstagram?: string | null;
  sellerId?: string | null;
  onInstagramClick?: (e: React.MouseEvent) => void;
  createdAt?: string;
}

const SellerInfo: React.FC<SellerInfoProps> = ({
  sellerName,
  sellerRating,
  reviewCount = 24,
  sellerInstagram,
  sellerId,
  onInstagramClick,
  createdAt
}) => {
  const { toast } = useToast();
  
  const handleInstagramClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // If custom handler is provided, use it
    if (onInstagramClick) {
      onInstagramClick(e);
      return;
    }

    // Default handler if no custom handler provided
    if (sellerInstagram) {
      console.log("Opening Instagram/video link:", sellerInstagram);
      window.open(sellerInstagram, '_blank');
      toast({
        title: "Opening video content",
        description: `Visiting ${sellerName}'s video content`,
        duration: 2000
      });
    } else {
      toast({
        title: "Video content not available",
        description: "The seller has not provided any video links",
        variant: "destructive",
        duration: 2000
      });
    }
  };

  const openRecommendationChat = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Send a test request to our recommendation service
      const { data, error } = await supabase.functions.invoke('whatsapp-recommendations', {
        body: { 
          test: true,
          query: `Recommendations similar to ${sellerName}'s listings`,
          phone: null // Don't actually send a WhatsApp message in test mode
        }
      });
      
      if (error) {
        console.error("Error connecting to recommendation service:", error);
        toast({
          title: "Service temporarily unavailable",
          description: "Our recommendation service is currently unavailable. Please try again later.",
          variant: "destructive",
          duration: 3000
        });
        return;
      }
      
      // If service is working, open WhatsApp with pre-filled message
      const whatsappMessage = `Hi, I'd like to get recommendations similar to ${sellerName}'s listings!`;
      const whatsappNumber = '1234567890'; // Default fallback number
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
      
      window.open(whatsappUrl, '_blank');
      
      toast({
        title: "Opening WhatsApp",
        description: "Connect with our recommendation bot via WhatsApp",
        duration: 2000
      });
      
    } catch (err) {
      console.error("Failed to connect to recommendation service:", err);
      toast({
        title: "Connection error",
        description: "Failed to connect to our recommendation service",
        variant: "destructive",
        duration: 3000
      });
    }
  };
  
  const isVideoLink = sellerInstagram && (sellerInstagram.includes('youtube.com') || sellerInstagram.includes('vimeo.com') || sellerInstagram.includes('tiktok.com') || sellerInstagram.includes('instagram.com/reel'));
  
  return <div className="flex flex-col w-full">
      <div className="flex items-center mb-1 w-full py-0">
        <span className="text-muted-foreground text-sm mr-1">Seller</span>
        {sellerId ? <Link to={`/seller/${sellerId}`} className="font-medium text-lg hover:text-primary hover:underline" onClick={e => e.stopPropagation()} // Prevent triggering parent card click
      >
            {sellerName}
          </Link> : <span className="font-medium text-base">{sellerName}</span>}
      </div>
      <div className="flex items-center w-full rounded-sm py-0 my-0 ml-2">
        <StarRating rating={sellerRating} showCount={true} count={reviewCount} size="small" />
        
        <div className="flex items-center ml-auto gap-3">
          {sellerInstagram && <button onClick={handleInstagramClick} className="text-muted-foreground hover:text-primary flex items-center gap-1.5 flex-shrink-0" title="View Instagram or Video Content">
              <Instagram className="h-5 w-5" />
              {isVideoLink && <Film className="h-4 w-4 text-purple-500" />}
          </button>}
          
          <button 
            onClick={openRecommendationChat}
            className="text-muted-foreground hover:text-primary flex items-center gap-1.5 flex-shrink-0" 
            title="Get similar recommendations via WhatsApp"
          >
            <MessageSquare className="h-5 w-5 text-green-600" />
          </button>
        </div>
      </div>
    </div>;
};

export default SellerInfo;
