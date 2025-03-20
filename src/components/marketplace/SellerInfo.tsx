
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
    <div className="flex flex-col w-full">
      <div className="flex items-center gap-4 mb-4 w-full">
        <span className="text-muted-foreground text-lg">Seller</span>
        {sellerId ? (
          <Link 
            to={`/seller/${sellerId}`} 
            className="font-medium text-xl hover:text-primary hover:underline"
            onClick={(e) => e.stopPropagation()} // Prevent triggering parent card click
          >
            {sellerName}
          </Link>
        ) : (
          <span className="font-medium text-xl">{sellerName}</span>
        )}
      </div>
      <div className="flex items-center gap-8 w-full">
        <StarRating rating={sellerRating} showCount={true} count={reviewCount} size="medium" />
        {sellerInstagram && onInstagramClick && (
          <button 
            onClick={onInstagramClick}
            className="text-muted-foreground hover:text-primary flex-shrink-0"
          >
            <Instagram className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SellerInfo;
