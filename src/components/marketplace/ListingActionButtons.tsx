import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileText, File } from 'lucide-react';

interface ListingActionButtonsProps {
  listingId: string;
  title: string;
  price: number;
  sellerPhone?: string | null;
  sellerWhatsapp?: string | null;
  sellerInstagram?: string | null;
  location: string;
  mapLink?: string | null;
  bill_images?: string[];
  inspection_certificates?: string[];
}

const ListingActionButtons: React.FC<ListingActionButtonsProps> = ({
  listingId,
  title,
  price,
  sellerPhone,
  sellerWhatsapp,
  sellerInstagram,
  location,
  mapLink,
  bill_images,
  inspection_certificates,
}) => {
  const { toast } = useToast();

  const handleViewCertificates = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inspection_certificates && inspection_certificates.length > 0) {
      window.open(inspection_certificates[0], '_blank');
      toast({
        title: "Opening inspection report",
        description: "You are viewing the inspection report for this listing",
        duration: 2000
      });
    } else {
      toast({
        title: "No Inspection Report",
        description: "No inspection report available for this listing",
        variant: "destructive",
      });
    }
  };

  const handleViewBill = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (bill_images && bill_images.length > 0) {
      window.open(bill_images[0], '_blank');
    } else {
      toast({
        title: "No Bill Available",
        description: "Original bill images are not available for this listing",
        variant: "destructive",
      });
    }
  };

  const handleCallSeller = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sellerPhone) {
      window.location.href = `tel:${sellerPhone}`;
      toast({
        title: "Calling Seller",
        description: `Calling seller at ${sellerPhone}`,
        duration: 2000
      });
    } else {
      toast({
        title: "Seller Phone Not Available",
        description: "Seller phone number not available for this listing",
        variant: "destructive",
      });
    }
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sellerWhatsapp) {
      window.open(`https://wa.me/${sellerWhatsapp}`, '_blank');
      toast({
        title: "Opening WhatsApp Chat",
        description: `Opening WhatsApp chat with seller at ${sellerWhatsapp}`,
        duration: 2000
      });
    } else {
      toast({
        title: "WhatsApp Not Available",
        description: "Seller WhatsApp number not available for this listing",
        variant: "destructive",
      });
    }
  };

  const handleInstagramClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sellerInstagram) {
      window.open(sellerInstagram);
      toast({
        title: "Opening Instagram profile",
        description: `Visiting ${title}'s Instagram profile`,
        duration: 2000
      });
    } else {
      toast({
        title: "Instagram Not Available",
        description: "This seller has not provided an Instagram link",
        variant: "destructive",
        duration: 2000
      });
    }
  };

  const handleLocationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapLink) {
      window.open(mapLink, '_blank');
      toast({
        title: "Opening location in maps",
        description: `Visiting ${location} in maps`,
        duration: 2000
      });
    } else {
      toast({
        title: "Location Not Available",
        description: "This seller has not provided a map link",
        variant: "destructive",
        duration: 2000
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {sellerPhone && (
        <Button variant="outline" size="sm" onClick={handleCallSeller}>
          Call Seller
        </Button>
      )}

      {sellerWhatsapp && (
        <Button variant="outline" size="sm" onClick={handleWhatsApp}>
          WhatsApp
        </Button>
      )}

      {sellerInstagram && (
        <Button variant="outline" size="sm" onClick={handleInstagramClick}>
          Instagram
        </Button>
      )}

      <Button variant="outline" size="sm" onClick={handleLocationClick}>
        Location
      </Button>
      
      {inspection_certificates && inspection_certificates.length > 0 && (
        <Button
          variant="secondary"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleViewCertificates}
        >
          <FileText className="h-4 w-4" />
          <span>Inspection report</span>
        </Button>
      )}
      
      <Button
        variant="default"
        size="sm"
        className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white"
        onClick={handleViewBill}
      >
        <File className="h-4 w-4" />
        <span>View Bill</span>
      </Button>
    </div>
  );
};

export default ListingActionButtons;
