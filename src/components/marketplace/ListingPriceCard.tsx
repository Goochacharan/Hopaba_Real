
import React from 'react';
import SellerInfo from './SellerInfo';
import ListingActionButtons from './ListingActionButtons';

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
  return (
    <div className="sticky top-24 space-y-6">
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#1EAEDB]">
              {formatPrice(price)}
            </h2>
          </div>
          <SellerInfo 
            sellerName={sellerName} 
            sellerRating={sellerRating} 
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
    </div>
  );
};

export default ListingPriceCard;
