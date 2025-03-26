
import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { Instagram } from 'lucide-react';
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
  sellerId,
  onInstagramClick,
  createdAt
}) => {
  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center gap-3 mb-3 w-full py-0">
        <span className="text-muted-foreground text-sm">Seller</span>
        {sellerId ? (
          <Link 
            to={`/seller/${sellerId}`} 
            className="font-medium text-lg hover:text-primary hover:underline" 
            onClick={e => e.stopPropagation()} // Prevent triggering parent card click
          >
            {sellerName}
          </Link>
        ) : (
          <span className="font-medium text-lg">{sellerName}</span>
        )}
      </div>
      <div className="flex items-center gap-6 w-full rounded-sm py-0 my-0 px-[25px] mx-[2px]">
        <StarRating rating={sellerRating} showCount={true} count={reviewCount} size="small" />
      </div>
    </div>
  );
};

export default SellerInfo;
