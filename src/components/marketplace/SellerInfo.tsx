import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { UserRound, Badge as BadgeIcon } from 'lucide-react';

interface SellerInfoProps {
  sellerName: string;
  sellerRating: number;
  reviewCount?: number;
  sellerInstagram?: string | null;
  sellerId?: string | null;
  onInstagramClick?: (e: React.MouseEvent) => void;
  createdAt?: string;
  sellerRole?: string;
}

const SellerInfo: React.FC<SellerInfoProps> = ({
  sellerName,
  sellerRating,
  reviewCount = 0,
  sellerInstagram,
  sellerId,
  onInstagramClick,
  createdAt,
  sellerRole = 'owner'
}) => {
  const {
    toast
  } = useToast();
  const [actualRating, setActualRating] = useState<number>(sellerRating);
  const [actualReviewCount, setActualReviewCount] = useState<number>(reviewCount || 0);

  useEffect(() => {
    if (sellerId) {
      fetchSellerRating(sellerId);
    }
  }, [sellerId]);

  const fetchSellerRating = async (sellerIdValue: string) => {
    try {
      const {
        data,
        error
      } = await supabase.from('seller_reviews').select('rating').eq('seller_id', sellerIdValue);
      if (error) {
        console.error('Error fetching seller reviews:', error);
        return;
      }
      if (data && data.length > 0) {
        const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
        const avgRating = totalRating / data.length;
        setActualRating(Math.round(avgRating * 10) / 10);
        setActualReviewCount(data.length);
        console.log(`Fetched ${data.length} reviews for seller ${sellerIdValue}, actual rating: ${avgRating}`);
      } else {
        console.log(`No reviews found for seller ${sellerIdValue}`);
      }
    } catch (err) {
      console.error('Failed to fetch seller rating:', err);
    }
  };

  const handleInstagramClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInstagramClick) {
      onInstagramClick(e);
      return;
    }
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
      <div className="flex items-center justify-end w-full rounded bg-lime-300 py-[2px] mx-0 px-[5px]">
        <span className="text-xs mr-1 text-gray-950 px-0 mx-[5px]">seller</span>
        <span className="text-sm font-medium">{sellerName}</span>
      </div>

      <div className="flex items-center justify-between w-full mt-1">
        <Badge 
          variant="default" 
          className={`text-xs px-2 py-0.5 flex items-center gap-1 font-bold 
            ${sellerRole === 'owner' 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-600 text-white'}
            transition-all duration-300 ease-in-out 
            shadow-sm`}
        >
          {sellerRole === 'owner' ? (
            <UserRound className="h-3 w-3" />
          ) : (
            <BadgeIcon className="h-3 w-3" />
          )}
          {sellerRole === 'owner' ? 'Owner' : 'Agent'}
        </Badge>
        
        <div className="flex items-center">
          <StarRating rating={actualRating} showCount={true} count={actualReviewCount} size="small" />
        </div>
      </div>
    </div>;
};

export default SellerInfo;
