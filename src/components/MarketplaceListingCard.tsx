
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, IndianRupee, Shield, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import SellerInfo from './marketplace/SellerInfo';
import { formatDistance } from '@/lib/locationUtils';

interface MarketplaceListingCardProps {
  listing: MarketplaceListing;
  className?: string;
  showDistance?: boolean;
}

const MarketplaceListingCard: React.FC<MarketplaceListingCardProps> = ({ 
  listing, 
  className,
  showDistance = false
}) => {
  const { 
    id, 
    title, 
    price, 
    location, 
    category,
    condition,
    images,
    seller_name,
    seller_rating,
    review_count,
    seller_instagram,
    seller_id,
    created_at,
    is_negotiable,
    inspection_certificates,
    model_year,
    distance,
    seller_role
  } = listing;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const createdDate = new Date(created_at);
  const now = new Date();
  const differenceMs = now.getTime() - createdDate.getTime();
  const differenceDays = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
  const differenceHours = Math.floor(differenceMs / (1000 * 60 * 60));
  const differenceMinutes = Math.floor(differenceMs / (1000 * 60));

  let timeAgo;
  if (differenceDays > 0) {
    timeAgo = `${differenceDays} day${differenceDays > 1 ? 's' : ''} ago`;
  } else if (differenceHours > 0) {
    timeAgo = `${differenceHours} hour${differenceHours > 1 ? 's' : ''} ago`;
  } else {
    timeAgo = `${differenceMinutes} minute${differenceMinutes !== 1 ? 's' : ''} ago`;
  }

  const hasCertificates = inspection_certificates && inspection_certificates.length > 0;

  return (
    <Link to={`/marketplace/${id}`}>
      <Card className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-md border-muted/60 rounded-xl h-full group", 
        className
      )}>
        <div className="relative pt-[56.25%] overflow-hidden bg-muted/30">
          {images && images.length > 0 ? (
            <img 
              src={images[0]} 
              alt={title} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted">
              No Image
            </div>
          )}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5">
            {condition && (
              <Badge variant={condition === 'new' ? "default" : "secondary"} className="capitalize">
                {condition}
              </Badge>
            )}
            {hasCertificates && (
              <Badge variant="outline" className="bg-white/90 border-green-200 text-green-800 flex gap-1.5 items-center">
                <Shield className="h-3 w-3" /> Certified
              </Badge>
            )}
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold line-clamp-2 text-lg">{title}</h3>
              {model_year && (
                <div className="text-muted-foreground text-sm mt-0.5">Year: {model_year}</div>
              )}
            </div>
            <div className="font-bold text-lg flex items-center">
              <IndianRupee className="h-[15px] w-[15px] text-lg" />
              <span>{formatPrice(price).replace('₹', '')}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-1">
            <div className="flex items-center text-muted-foreground text-sm gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate max-w-[150px]">{location}</span>
              
              {showDistance && distance !== undefined && (
                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 ml-1">
                  {formatDistance(distance)} away
                </Badge>
              )}
            </div>

            <div className="flex items-center text-muted-foreground text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {timeAgo}
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-border">
            <SellerInfo
              sellerName={seller_name}
              sellerRating={seller_rating || 4}
              reviewCount={review_count}
              sellerInstagram={seller_instagram}
              sellerId={seller_id}
              createdAt={created_at}
              sellerRole={seller_role}
            />
            
            {is_negotiable && (
              <div className="text-xs text-blue-600 font-medium mt-1 text-right">
                Price negotiable
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default MarketplaceListingCard;
