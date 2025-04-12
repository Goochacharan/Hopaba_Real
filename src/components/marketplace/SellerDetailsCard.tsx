
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, MessageCircle, Instagram, FileCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import ListingActionButtons from './ListingActionButtons';
import CertificateViewer from './CertificateViewer';

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
  mapLink?: string | null;
  reviewCount?: number;
  inspectionCertificates?: string[];
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
  reviewCount = 0,
  inspectionCertificates = []
}) => {
  const { toast } = useToast();
  const [certificateViewerOpen, setCertificateViewerOpen] = useState(false);
  const hasCertificates = inspectionCertificates && inspectionCertificates.length > 0;

  const handleContactClick = (type: 'phone' | 'whatsapp' | 'instagram') => {
    let contactInfo = '';
    let contactType = '';
    
    switch(type) {
      case 'phone':
        contactInfo = sellerPhone || '';
        contactType = 'phone number';
        break;
      case 'whatsapp':
        contactInfo = sellerWhatsapp || '';
        contactType = 'WhatsApp';
        break;
      case 'instagram':
        contactInfo = sellerInstagram || '';
        contactType = 'Instagram';
        break;
    }
    
    if (!contactInfo) {
      toast({
        title: `No ${contactType} available`,
        description: `This seller hasn't provided their ${contactType}.`,
        variant: "destructive",
      });
      return;
    }
    
    // Handle the contact action based on type
    if (type === 'phone') {
      window.location.href = `tel:${contactInfo}`;
    } else if (type === 'whatsapp') {
      window.open(`https://wa.me/${contactInfo.replace(/\+/g, '')}?text=I'm interested in your listing: ${title}`, '_blank');
    } else if (type === 'instagram') {
      window.open(`https://instagram.com/${contactInfo.replace('@', '')}`, '_blank');
    }
    
    toast({
      title: `Contacting via ${contactType}`,
      description: `Opening ${contactType} to contact ${sellerName}`,
    });
  };

  return (
    <>
      <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Seller Information</h3>
            <p className="text-muted-foreground">{sellerName}</p>
          </div>
          {hasCertificates && (
            <Badge 
              variant="outline" 
              className="border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 cursor-pointer flex items-center gap-1.5"
              onClick={() => setCertificateViewerOpen(true)}
            >
              <FileCheck className="h-4 w-4 text-amber-600" />
              <span>View Inspection Certificate</span>
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{location}</span>
            </div>
            
            {sellerPhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{sellerPhone}</span>
              </div>
            )}
            
            {sellerWhatsapp && (
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <span>{sellerWhatsapp} (WhatsApp)</span>
              </div>
            )}
            
            {sellerInstagram && (
              <div className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-muted-foreground" />
                <span>{sellerInstagram}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => handleContactClick('phone')}>
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleContactClick('whatsapp')}>
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            </div>
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
      
      {hasCertificates && (
        <CertificateViewer 
          certificates={inspectionCertificates}
          open={certificateViewerOpen}
          onOpenChange={setCertificateViewerOpen}
        />
      )}
    </>
  );
};

export default SellerDetailsCard;
