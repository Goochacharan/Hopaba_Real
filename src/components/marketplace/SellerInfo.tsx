
import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { Instagram, Film } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
  const {
    toast
  } = useToast();
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
  const isVideoLink = sellerInstagram && (sellerInstagram.includes('youtube.com') || sellerInstagram.includes('vimeo.com') || sellerInstagram.includes('tiktok.com') || sellerInstagram.includes('instagram.com/reel'));
  return <div className="flex flex-col w-full">
      <div className="flex items-center justify-end w-full py-0">
        <span className="text-muted-foreground text-xs mr-1">Seller</span>
        {sellerId ? <Link to={`/seller/${sellerId}`} onClick={e => e.stopPropagation()} // Prevent triggering parent card click
      className="text-xs hover:text-primary hover:underline">
            {sellerName}
          </Link> : <span className="text-sm font-medium">{sellerName}</span>}
      </div>
      <div className="flex items-center justify-end w-full rounded-sm py-0 my-0">
        <StarRating rating={sellerRating} showCount={true} count={reviewCount} size="small" />
        
        <div className="flex items-center ml-2 gap-2">
          {sellerInstagram && <button onClick={handleInstagramClick} className="text-muted-foreground hover:text-primary flex items-center gap-1 flex-shrink-0" title="View Instagram or Video Content">
              <Instagram className="h-4 w-4" />
              {isVideoLink && <Film className="h-3 w-3 text-purple-500" />}
          </button>}
        </div>
      </div>
    </div>;
};
export default SellerInfo;
