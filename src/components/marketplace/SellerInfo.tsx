
import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { Instagram, Film } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SellerInfoProps {
  sellerName: string;
  sellerRating: number;
  reviewCount?: number;
  sellerInstagram?: string | null;
  sellerId?: string | null;
  onInstagramClick?: (e: React.MouseEvent) => void;
  createdAt?: string;
  isCompact?: boolean;
}

const SellerInfo: React.FC<SellerInfoProps> = ({
  sellerName,
  sellerRating,
  reviewCount = 24,
  sellerInstagram,
  sellerId,
  onInstagramClick,
  createdAt,
  isCompact = false
}) => {
  return (
    <div className="flex flex-col w-full">
      <div className={cn(
        "flex items-center gap-3 w-full", 
        isCompact ? "mb-1" : "mb-3"
      )}>
        <span className="text-muted-foreground text-sm">Seller</span>
        {sellerId ? (
          <Link 
            to={`/seller/${sellerId}`} 
            className={cn(
              "font-medium hover:text-primary hover:underline",
              isCompact ? "text-base" : "text-lg" 
            )}
            onClick={e => e.stopPropagation()} // Prevent triggering parent card click
          >
            {sellerName}
          </Link>
        ) : (
          <span className={cn(
            "font-medium", 
            isCompact ? "text-base" : "text-lg"
          )}>
            {sellerName}
          </span>
        )}
      </div>
      <div className={cn(
        "flex items-center gap-6 w-full rounded-sm py-0 my-0",
        isCompact ? "px-[15px] mx-[1px]" : "px-[25px] mx-[2px]"
      )}>
        <StarRating 
          rating={sellerRating} 
          showCount={true} 
          count={reviewCount} 
          size={isCompact ? "xsmall" : "small"} 
        />
        {sellerInstagram && onInstagramClick && (
          <button 
            onClick={onInstagramClick} 
            className="text-muted-foreground hover:text-primary flex items-center gap-1.5 flex-shrink-0"
            title="View Instagram or Video Content"
          >
            <Instagram className={isCompact ? "h-4 w-4" : "h-5 w-5"} />
            {(sellerInstagram.includes('youtube.com') || 
              sellerInstagram.includes('vimeo.com') || 
              sellerInstagram.includes('tiktok.com')) && 
              <Film className={isCompact ? "h-3.5 w-3.5" : "h-4 w-4"} className="text-purple-500" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default SellerInfo;
