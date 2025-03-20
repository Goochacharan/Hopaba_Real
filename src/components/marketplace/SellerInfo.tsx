
import React from 'react';
import { Instagram } from 'lucide-react';
import StarRating from './StarRating';

interface SellerInfoProps {
  sellerName: string;
  sellerRating: number;
  reviewCount?: number;
  sellerInstagram?: string | null;
  onInstagramClick?: (e: React.MouseEvent) => void;
}

const SellerInfo: React.FC<SellerInfoProps> = ({
  sellerName,
  sellerRating,
  reviewCount = 24,
  sellerInstagram,
  onInstagramClick
}) => {
  const handleInstagramClick = (e: React.MouseEvent) => {
    if (onInstagramClick) {
      e.stopPropagation();
      onInstagramClick(e);
    }
  };

  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-muted-foreground text-sm">Seller</span>
        <span className="font-medium text-base">{sellerName}</span>
        {sellerInstagram && (
          <button
            onClick={handleInstagramClick}
            className="bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 text-white p-1 rounded-md hover:shadow-md transition-all"
            title="Visit Instagram"
          >
            <Instagram className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <StarRating rating={sellerRating} showCount={true} count={reviewCount} />
      </div>
    </div>
  );
};

export default SellerInfo;
