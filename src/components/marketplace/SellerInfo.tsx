
import React from 'react';
import StarRating from './StarRating';

interface SellerInfoProps {
  sellerName: string;
  sellerRating: number;
  reviewCount?: number;
}

const SellerInfo: React.FC<SellerInfoProps> = ({
  sellerName,
  sellerRating,
  reviewCount = 24
}) => {
  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-muted-foreground text-sm">Seller</span>
        <span className="font-medium text-base">{sellerName}</span>
      </div>
      <div className="flex items-center gap-2">
        <StarRating rating={sellerRating} showCount={true} count={reviewCount} />
      </div>
    </div>
  );
};

export default SellerInfo;
