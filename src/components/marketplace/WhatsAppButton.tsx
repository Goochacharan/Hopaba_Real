
import React from 'react';
import { Button } from '@/components/ui/button';

interface WhatsAppButtonProps {
  phoneNumber: string;
  listingTitle: string;
  listingPrice: number;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ 
  phoneNumber, 
  listingTitle, 
  listingPrice 
}) => {
  const formattedPhoneNumber = phoneNumber.startsWith('+') 
    ? phoneNumber.substring(1) 
    : phoneNumber;
    
  const message = `Hello! I'm interested in your listing "${listingTitle}" for ${listingPrice}. Is it still available?`;
  const whatsappUrl = `https://wa.me/${formattedPhoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <Button asChild variant="default" className="w-full bg-green-600 hover:bg-green-700">
      <a 
        href={whatsappUrl}
        target="_blank" 
        rel="noopener noreferrer" 
        className="w-full flex items-center justify-center gap-2"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="h-4 w-4"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M5 2C3.343 2 2 3.343 2 5v14c0 1.657 1.343 3 3 3h14c1.657 0 3-1.343 3-3V5c0-1.657-1.343-3-3-3H5zm7.993 19H13c-3.39 0-6.147-2.733-6.147-6.103C6.853 11.527 9.61 8.794 13 8.794c3.39 0 6.147 2.733 6.147 6.103 0 3.37-2.757 6.103-6.147 6.103zm.15-1.75a4.413 4.413 0 0 0 4.419-4.409 4.413 4.413 0 0 0-4.419-4.409 4.413 4.413 0 0 0-4.419 4.409 4.413 4.413 0 0 0 4.419 4.409z" fill-rule="evenodd" clip-rule="evenodd"/>
        </svg>
        WhatsApp Seller
      </a>
    </Button>
  );
};
