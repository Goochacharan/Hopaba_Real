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
  return <div className="flex flex-col w-full">
      <div className="flex items-center gap-3 mb-3 w-full">
        <span className="text-muted-foreground">Seller</span>
        {sellerId ? <Link to={`/seller/${sellerId}`} onClick={e => e.stopPropagation()} // Prevent triggering parent card click
      className="font-medium text-lg hover:text-primary hover:underline px-0 mx-[54px]">
            {sellerName}
          </Link> : <span className="font-medium text-lg">{sellerName}</span>}
      </div>
      <div className="flex items-center gap-6 w-full px-0 mx-[106px]">
        <StarRating rating={sellerRating} showCount={true} count={reviewCount} size="small" />
        {sellerInstagram && onInstagramClick && <button onClick={onInstagramClick} className="text-muted-foreground hover:text-primary flex-shrink-0">
            <Instagram className="h-5 w-5" />
          </button>}
      </div>
    </div>;
};
export default SellerInfo;