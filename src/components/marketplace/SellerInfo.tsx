
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Instagram } from 'lucide-react';

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
  reviewCount = 0,
  sellerInstagram,
  sellerId,
  onInstagramClick,
  createdAt
}) => {
  const { toast } = useToast();
  const [actualRating, setActualRating] = useState<number>(sellerRating);
  const [actualReviewCount, setActualReviewCount] = useState<number>(reviewCount || 0);

  useEffect(() => {
    if (sellerId) {
      fetchSellerRating(sellerId);
    }
  }, [sellerId]);

  const fetchSellerRating = async (sellerIdValue: string) => {
    try {
      const { data, error } = await supabase
        .from('seller_reviews')
        .select('rating')
        .eq('seller_id', sellerIdValue);

      if (error) {
        console.error('Error fetching seller reviews:', error);
        return;
      }

      if (data && data.length > 0) {
        // Calculate average rating
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

    // If custom handler is provided, use it
    if (onInstagramClick) {
      onInstagramClick(e);
      return;
    }

    // Default handler if no custom handler provided
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

  const isVideoLink = sellerInstagram && (
    sellerInstagram.includes('youtube.com') || 
    sellerInstagram.includes('vimeo.com') || 
    sellerInstagram.includes('tiktok.com') || 
    sellerInstagram.includes('instagram.com/reel')
  );

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-end w-full py-0">
        <span className="text-muted-foreground text-xs mr-1">Seller</span>
        {sellerId ? (
          <Link 
            to={`/seller/${sellerId}`} 
            onClick={e => e.stopPropagation()} 
            className="text-s hover:text-primary hover:underline"
          >
            {sellerName}
          </Link>
        ) : (
          <span className="text-sm font-medium">{sellerName}</span>
        )}
        
        {sellerInstagram && (
          <button
            onClick={handleInstagramClick}
            className="flex items-center gap-1.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all ml-2 py-1 px-2.5"
            title="Watch video content"
          >
            <Instagram className="h-3 w-3 text-white" />
            <span className="text-xs font-medium">Video</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-end w-full">
        <StarRating 
          rating={actualRating} 
          showCount={true} 
          count={actualReviewCount} 
          size="small" 
        />
      </div>
    </div>
  );
};

export default SellerInfo;
