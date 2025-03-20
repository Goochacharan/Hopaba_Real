
import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { Instagram } from 'lucide-react';

interface SellerInfoProps {
  sellerName: string;
  sellerRating: number;
  reviewCount?: number;
  sellerInstagram?: string | null;
  sellerId?: string | null;
  onInstagramClick?: (e: React.MouseEvent) => void;
}

const SellerInfo: React.FC<SellerInfoProps> = ({
  sellerName,
  sellerRating,
  reviewCount = 24,
  sellerInstagram,
  sellerId,
  onInstagramClick
}) => {
  return (
    <div className="flex flex-col w-full items-end">
      <div className="flex items-center gap-2 mb-2 w-full justify-end">
        <span className="text-muted-foreground text-sm">Seller</span>
        {sellerId ? (
          <Link 
            to={`/seller/${sellerId}`} 
            className="font-medium text-base hover:text-primary hover:underline truncate max-w-[200px]"
            onClick={(e) => e.stopPropagation()} // Prevent triggering parent card click
          >
            {sellerName}
          </Link>
        ) : (
          <span className="font-medium text-base truncate max-w-[200px]">{sellerName}</span>
        )}
      </div>
      <div className="flex items-center gap-2 w-full justify-end">
        <StarRating rating={sellerRating} showCount={true} count={reviewCount} />
        {sellerInstagram && onInstagramClick && (
          <button 
            onClick={onInstagramClick}
            className="text-muted-foreground hover:text-primary"
          >
            <Instagram className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SellerInfo;
