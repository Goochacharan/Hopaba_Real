import React from 'react';
import ListingPriceCard from './ListingPriceCard';
import SellerInfo from './SellerInfo';

interface SellerDetailsCardProps {
  id: string;
  title: string;
  price: number;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  sellerPhone: string | null;
  sellerWhatsapp: string | null;
  sellerInstagram: string | null;
  location: string;
  createdAt: string;
  mapLink: string | null;
  reviewCount?: number;
  isNegotiable?: boolean;
  condition?: string;
  inspectionCertificates?: string[];
  ownershipNumber?: string;
  modelYear?: string;
  sellerRole?: 'owner' | 'dealer';
}

const SellerDetailsCard: React.FC<SellerDetailsCardProps> = ({
  id,
  title,
  price,
  sellerId,
  sellerName,
  sellerRating,
  sellerPhone,
  sellerWhatsapp,
  sellerInstagram,
  location,
  createdAt,
  mapLink,
  reviewCount,
  isNegotiable,
  condition = 'Used',
  inspectionCertificates = [],
  ownershipNumber,
  modelYear,
  sellerRole
}) => {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-0 overflow-hidden mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Seller Information</h3>
          </div>
          <SellerInfo
            sellerName={sellerName}
            sellerRating={sellerRating}
            sellerId={sellerId}
            reviewCount={reviewCount}
            sellerInstagram={sellerInstagram}
            createdAt={createdAt}
            sellerRole={sellerRole}
          />
        </div>
        
        <div className="md:border-l md:border-t-0 border-t p-0">
          <ListingPriceCard
            id={id}
            title={title}
            price={price}
            sellerName={sellerName}
            sellerRating={sellerRating}
            sellerPhone={sellerPhone}
            sellerWhatsapp={sellerWhatsapp}
            sellerInstagram={sellerInstagram}
            location={location}
            createdAt={createdAt}
            condition={condition}
            mapLink={mapLink}
            isNegotiable={isNegotiable}
            inspectionCertificates={inspectionCertificates}
            ownershipNumber={ownershipNumber}
            modelYear={modelYear}
          />
        </div>
      </div>
    </div>
  );
};

export default SellerDetailsCard;
