import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { Instagram, Film } from 'lucide-react';
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
  return <div className="flex flex-col w-full">
      <div className="flex items-center gap-3 mb-3 w-full py-0">
        <span className="text-muted-foreground text-sm">Seller</span>
        {sellerId ? <Link to={`/seller/${sellerId}`} className="font-medium text-lg hover:text-primary hover:underline" onClick={e => e.stopPropagation()} // Prevent triggering parent card click
      >
            {sellerName}
          </Link> : <span className="font-medium text-lg">{sellerName}</span>}
      </div>
      <div className="flex items-center gap-6 w-full rounded-sm py-0 my-0 px-[25px] mx-[2px]">
        <StarRating rating={sellerRating} showCount={true} count={reviewCount} size="small" />
        {sellerInstagram && onInstagramClick && <button onClick={onInstagramClick} className="text-muted-foreground hover:text-primary flex items-center gap-1.5 flex-shrink-0" title="View Instagram or Video Content">
            <Instagram className="h-5 w-5" />
            {sellerInstagram.includes('youtube.com') || sellerInstagram.includes('vimeo.com') || sellerInstagram.includes('tiktok.com') && <Film className="h-4 w-4 text-purple-500" />}
          </button>}
      </div>
    </div>;
};
export default SellerInfo;