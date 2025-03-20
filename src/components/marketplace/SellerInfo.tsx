
import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';

interface SellerInfoProps {
  sellerName: string;
  sellerRating: number;
  reviewCount?: number;
  sellerInstagram?: string | null;
  sellerId?: string;
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
    <div className="flex flex-col items-end">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-muted-foreground text-sm">Seller</span>
        {sellerId ? (
          <Link 
            to={`/seller/${sellerId}`} 
            className="font-medium text-base hover:text-primary hover:underline"
            onClick={(e) => e.stopPropagation()} // Prevent triggering parent card click
          >
            {sellerName}
          </Link>
        ) : (
          <span className="font-medium text-base">{sellerName}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <StarRating rating={sellerRating} showCount={true} count={reviewCount} />
      </div>
    </div>
  );
};

export default SellerInfo;
