import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { VerifiedMark } from '@/components/VerifiedMark';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Navigation2, Instagram } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { WhatsAppButton } from './WhatsAppButton';

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
  ownershipNumber?: string;
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
  isNegotiable = false,
  ownershipNumber
}) => {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(<Star key={i} className={cn("h-4 w-4", i < rating ? "text-yellow-500" : "text-gray-400")} />);
    }
    return stars;
  };

  return (
    <Card className="bg-secondary/80">
      <CardHeader>
        <CardTitle>Seller Details</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={`https://avatar.vercel.sh/${sellerName}.png`} alt={sellerName} />
            <AvatarFallback>{sellerName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <p className="text-sm font-semibold">{sellerName}</p>
              <VerifiedMark />
            </div>
            <div className="flex items-center">
              {renderStars(sellerRating)}
              <span className="text-xs text-muted-foreground ml-2">
                {sellerRating} ({reviewCount} Reviews)
              </span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{location}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Listed {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </p>
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          {sellerPhone && (
            <Button asChild variant="outline" className="w-full">
              <a href={`tel:${sellerPhone}`} className="w-full flex items-center justify-center gap-2">
                <Navigation2 className="h-4 w-4" />
                Call Seller
              </a>
            </Button>
          )}

          {sellerWhatsapp && (
            <WhatsAppButton phoneNumber={sellerWhatsapp} listingTitle={title} listingPrice={price} />
          )}

          {sellerInstagram && (
            <Button asChild variant="secondary" className="w-full">
              <a href={sellerInstagram.startsWith('http') ? sellerInstagram : `https://instagram.com/${sellerInstagram}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2">
                <Instagram className="h-4 w-4" />
                Visit Instagram
              </a>
            </Button>
          )}
        </div>

        <Separator />

        <div className="flex justify-between">
          <Button asChild variant="link" size="sm">
            <Link to={`/user/${sellerId}`}>View Profile</Link>
          </Button>
          {mapLink && (
            <Button asChild variant="secondary" size="sm">
              <a href={mapLink} target="_blank" rel="noopener noreferrer">
                Open in Maps
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerDetailsCard;
