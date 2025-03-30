
import React from 'react';
import { Shield } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import SellerInfo from './SellerInfo';
import ListingActionButtons from './ListingActionButtons';
import ListingMetadata from './ListingMetadata';

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
  createdAt: string;
  condition: string;
  mapLink?: string | null;
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
  location,
  createdAt,
  condition,
  mapLink
}) => {
  return (
    <div className="sticky top-24 space-y-6">
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <div className="mb-0">
          <ListingMetadata 
            location={location} 
            createdAt={createdAt} 
            condition={condition} 
            sellerInstagram={sellerInstagram} 
            sellerName={sellerName} 
          />
        </div>
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="md:text-6xl font-extrabold text-gray-800 py-0 px-1 text-4xl -mb-1">
              {formatPrice(price)}
            </h2>
          </div>
          <div className="flex flex-col items-end">
            <SellerInfo sellerName={sellerName} sellerRating={sellerRating} />
          </div>
        </div>
        
        <ListingActionButtons 
          listingId={id} 
          title={title} 
          price={price} 
          sellerPhone={sellerPhone} 
          sellerWhatsapp={sellerWhatsapp} 
          sellerInstagram={sellerInstagram} 
          location={location} 
          mapLink={mapLink} 
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
