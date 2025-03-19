
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageSquare, MapPin, Instagram, Share2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface MarketplaceListingCardProps {
  listing: MarketplaceListing;
  className?: string;
}

const formatPrice = (price: number): string => {
  return '₹' + price.toLocaleString('en-IN');
};

const MarketplaceListingCard: React.FC<MarketplaceListingCardProps> = ({ listing, className }) => {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Check out this ${listing.title} for ${formatPrice(listing.price)}`,
        url: window.location.href,
      }).catch(error => {
        console.log('Error sharing', error);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied to clipboard",
        description: "You can now share this listing with others",
        duration: 3000,
      });
    }
  };

  const handleCall = () => {
    if (listing.seller_phone) {
      window.location.href = `tel:${listing.seller_phone}`;
    } else {
      toast({
        title: "Phone number not available",
        description: "The seller has not provided a phone number",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleWhatsApp = () => {
    if (listing.seller_whatsapp) {
      const message = `Hi, I'm interested in your listing "${listing.title}" for ${formatPrice(listing.price)}. Is it still available?`;
      window.open(`https://wa.me/${listing.seller_whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`);
    } else {
      toast({
        title: "WhatsApp not available",
        description: "The seller has not provided a WhatsApp number",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleInstagram = () => {
    if (listing.seller_instagram) {
      window.open(`https://instagram.com/${listing.seller_instagram}`);
    } else {
      toast({
        title: "Instagram not available",
        description: "The seller has not provided an Instagram handle",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleLocation = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.location)}`);
  };

  return (
    <Card className={cn("h-full flex flex-col overflow-hidden transition-all hover:shadow-md", className)}>
      <div className="relative overflow-hidden h-48">
        <Link to={`/marketplace/${listing.id}`}>
          <img 
            src={listing.images[0] || '/placeholder.svg'} 
            alt={listing.title} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
          <Badge className="absolute top-2 right-2 bg-primary/90">{listing.condition}</Badge>
        </Link>
      </div>
      
      <CardHeader className="p-4 pb-0">
        <Link to={`/marketplace/${listing.id}`} className="no-underline">
          <h3 className="text-lg font-semibold line-clamp-2 hover:text-primary transition-colors">{listing.title}</h3>
        </Link>
        <p className="text-xl font-bold text-primary mt-1">{formatPrice(listing.price)}</p>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{listing.description}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{listing.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-500" />
            <span className="text-sm">{listing.seller_rating.toFixed(1)}</span>
          </div>
        </div>
        
        <p className="text-sm font-medium mb-3">Seller: {listing.seller_name}</p>
        
        <div className="grid grid-cols-5 gap-1 mt-auto">
          <Button variant="outline" size="sm" className="h-10" onClick={handleCall}>
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-10" onClick={handleWhatsApp}>
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-10" onClick={handleLocation}>
            <MapPin className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-10" onClick={handleInstagram}>
            <Instagram className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-10" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketplaceListingCard;
