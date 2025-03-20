
import React from 'react';
import { Shield, Film } from 'lucide-react';
import SellerInfo from './SellerInfo';
import ListingActionButtons from './ListingActionButtons';
import { useToast } from '@/hooks/use-toast';

interface ListingPriceCardProps {
  id: string;
  title: string;
  price: number;
  sellerName: string;
  sellerRating: number;
  sellerPhone: string | null;
  sellerWhatsapp: string | null;
  sellerInstagram: string | null;
  location: string;
}

const formatPrice = (price: number): string => {
  return '₹' + price.toLocaleString('en-IN');
};

const ListingPriceCard: React.FC<ListingPriceCardProps> = ({
  id,
  title,
  price,
  sellerName,
  sellerRating,
  sellerPhone,
  sellerWhatsapp,
  sellerInstagram,
  location
}) => {
  const { toast } = useToast();

  const handleInstagramClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sellerInstagram) {
      window.open(sellerInstagram);
      toast({
        title: "Opening video content",
        description: `Visiting ${sellerName}'s video content`,
        duration: 2000,
      });
    } else {
      toast({
        title: "Video content not available",
        description: "The seller has not provided any video links",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <div className="sticky top-24 space-y-6">
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-[#1EAEDB]">
              {formatPrice(price)}
            </h2>
            {sellerInstagram && (
              <button
                onClick={handleInstagramClick}
                className="bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 p-2 rounded-md hover:shadow-md transition-all"
                title="Watch video content"
              >
                <Film className="h-5 w-5 text-white" />
              </button>
            )}
          </div>
          <SellerInfo 
            sellerName={sellerName} 
            sellerRating={sellerRating} 
            sellerInstagram={sellerInstagram}
            onInstagramClick={handleInstagramClick}
          />
        </div>
        
        <ListingActionButtons
          listingId={id}
          title={title}
          price={price}
          sellerPhone={sellerPhone}
          sellerWhatsapp={sellerWhatsapp}
          sellerInstagram={sellerInstagram}
          location={location}
        />
      </div>
      
      <div className="bg-[#1EAEDB]/5 rounded-xl p-6 border border-[#1EAEDB]/10">
        <div className="flex gap-4">
          <Shield className="h-5 w-5 text-[#1EAEDB]/70 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-sm mb-3">Safe trading tips</h4>
            <ul className="text-xs text-muted-foreground space-y-2.5">
              <li>• Meet in a public place</li>
              <li>• Verify the item before paying</li>
              <li>• Pay only after inspecting the item</li>
              <li>• Don't share personal financial information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingPriceCard;
