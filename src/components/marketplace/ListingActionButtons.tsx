
import React from 'react';
import { Heart, Phone, MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useWishlist } from '@/contexts/WishlistContext';

interface ListingActionButtonsProps {
  listingId: string;
  title: string;
  price: number;
  sellerPhone: string | null;
  sellerWhatsapp: string | null;
  sellerInstagram: string | null;
  location: string;
  isCompact?: boolean;
}

const ListingActionButtons: React.FC<ListingActionButtonsProps> = ({
  listingId,
  title,
  price,
  sellerPhone,
  sellerWhatsapp,
  sellerInstagram,
  location,
  isCompact = false
}) => {
  const { toast } = useToast();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isInWishlistAlready = isInWishlist(listingId);
  
  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sellerPhone) {
      window.open(`tel:${sellerPhone}`);
      toast({
        title: "Calling seller",
        description: `Dialing ${sellerPhone}`,
      });
    } else {
      toast({
        title: "Phone not available",
        description: "The seller has not provided a phone number",
        variant: "destructive",
      });
    }
  };
  
  const handleWhatsappClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sellerWhatsapp) {
      // Create WhatsApp link with pre-filled message
      const message = `Hi! I'm interested in your listing "${title}" for ${price} at ${location}.`;
      const whatsappUrl = `https://wa.me/${sellerWhatsapp}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl);
      toast({
        title: "Opening WhatsApp",
        description: "Connecting you with the seller",
      });
    } else {
      toast({
        title: "WhatsApp not available",
        description: "The seller has not provided a WhatsApp number",
        variant: "destructive",
      });
    }
  };
  
  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInWishlistAlready) {
      removeFromWishlist(listingId);
      toast({
        title: "Removed from wishlist",
        description: `${title} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist({
        id: listingId,
        title,
        price,
        location,
        created_at: new Date().toISOString(),
      }, 'marketplace');
      toast({
        title: "Added to wishlist",
        description: `${title} has been added to your wishlist.`,
      });
    }
  };
  
  return (
    <div className={cn(
      "flex items-center space-x-2",
      isCompact ? "mt-1" : "mt-2"
    )}>
      <Button 
        variant="default" 
        size={isCompact ? "xs" : "sm"}
        className={isCompact ? "py-0 px-3" : ""}
        onClick={handlePhoneClick}
      >
        <Phone className={cn("mr-2", isCompact ? "h-3 w-3" : "h-4 w-4")} />
        Call
      </Button>
      
      <Button 
        variant="outline" 
        size={isCompact ? "xs" : "sm"}
        className={isCompact ? "py-0 px-3" : ""}
        onClick={handleWhatsappClick}
      >
        <MessageSquareText className={cn("mr-2", isCompact ? "h-3 w-3" : "h-4 w-4")} />
        WhatsApp
      </Button>
      
      <Button 
        variant={isInWishlistAlready ? "secondary" : "ghost"} 
        size={isCompact ? "xs" : "sm"}
        className={cn(
          isCompact ? "ml-auto py-0 px-3" : "ml-auto",
          isInWishlistAlready ? "bg-primary/5 hover:bg-primary/10" : ""
        )}
        onClick={toggleWishlist}
      >
        <Heart 
          className={cn(
            isCompact ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2", 
            isInWishlistAlready ? "fill-primary text-primary" : ""
          )} 
        />
        {isInWishlistAlready ? "Saved" : "Save"}
      </Button>
    </div>
  );
};

export default ListingActionButtons;
