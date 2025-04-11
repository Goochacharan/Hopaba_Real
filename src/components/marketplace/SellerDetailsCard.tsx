import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import ListingPriceCard from './ListingPriceCard';
import ContactSellerForm from './ContactSellerForm';
interface SellerDetailsCardProps {
  id: string;
  title: string;
  price: number;
  isNegotiable?: boolean;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  sellerPhone: string | null;
  sellerWhatsapp: string | null;
  sellerInstagram: string | null;
  location: string;
  createdAt: string;
  mapLink?: string | null;
  reviewCount?: number;
}

const SellerDetailsCard: React.FC<SellerDetailsCardProps> = ({
  id,
  title,
  price,
  isNegotiable,
  sellerId,
  sellerName,
  sellerRating,
  sellerPhone,
  sellerWhatsapp,
  sellerInstagram,
  location,
  createdAt,
  mapLink,
  reviewCount
}) => {
  
  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <Tabs defaultValue="contact">
        <TabsList className="w-full justify-center">
          <TabsTrigger value="contact">Listing Price</TabsTrigger>
          <TabsTrigger value="reviews">Contact Seller</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contact" className="py-4">
          <div className="mb-6">
            <ListingPriceCard 
              id={id}
              title={title}
              price={price}
              isNegotiable={isNegotiable}
              sellerName={sellerName}
              sellerRating={sellerRating}
              sellerPhone={sellerPhone}
              sellerWhatsapp={sellerWhatsapp}
              sellerInstagram={sellerInstagram}
              location={location}
              createdAt={createdAt}
              condition=""
              mapLink={mapLink}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="reviews">
          <ContactSellerForm 
            listingId={id}
            sellerId={sellerId}
            sellerName={sellerName}
            sellerPhone={sellerPhone}
            sellerWhatsapp={sellerWhatsapp}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SellerDetailsCard;
