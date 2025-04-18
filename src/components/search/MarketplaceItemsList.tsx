import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Dot } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { DEFAULT_IMAGE } from '@/lib/constants';
import { extractCityFromText } from '@/lib/locationUtils';
import { Skeleton } from "@/components/ui/skeleton"

interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  category: string;
  images: string[];
  created_at: string;
  area: string;
  city: string;
  postal_code: string;
  seller_name: string;
  seller_rating: number;
  seller_avatar: string;
  model_year: string;
  location: string;
  distance?: number;
}

interface MarketplaceListingWithDistance extends Omit<MarketplaceListing, 'distance'> {
  distance?: number;
}

interface MarketplaceItemsListProps {
  listings: MarketplaceListingWithDistance[] | undefined;
  loading: boolean;
}

const MarketplaceItemsList: React.FC<MarketplaceItemsListProps> = ({ listings, loading }) => {
  if (loading) {
    return <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-5 w-3/4" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-1/2" />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-24 w-full rounded-md" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>;
  }

  if (!listings || listings.length === 0) {
    return <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <p className="text-muted-foreground">No listings found.</p>
        </CardContent>
      </Card>;
  }

  return <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {listings.map(listing => (
        <Card key={listing.id}>
          <Link to={`/marketplace/${listing.id}`}>
            <CardHeader>
              <CardTitle>{listing.title}</CardTitle>
              <CardDescription>
                ₹{listing.price} <Dot className="h-4 w-4 inline-block mx-1" /> {listing.condition}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <img
                src={listing.images[0] || DEFAULT_IMAGE}
                alt={listing.title}
                className="aspect-video w-full rounded-md object-cover"
                onError={(e: any) => { e.target.src = DEFAULT_IMAGE; }}
              />
              <p className="text-sm text-muted-foreground line-clamp-2">
                {listing.description}
              </p>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={listing.seller_avatar} />
                  <AvatarFallback>{listing.seller_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{listing.seller_name}</p>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < listing.seller_rating ? "text-yellow-500" : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Link>
          <CardFooter className="text-xs text-muted-foreground py-2 px-4 flex items-center justify-between">
            <div className="flex items-center">
              {listing.distance !== undefined && (
                <>
                  {listing.distance.toFixed(1)} km away
                  <Dot className="h-3 w-3 mx-1" />
                </>
              )}
              {listing.city && (
                <>
                  {listing.city}
                  <Dot className="h-3 w-3 mx-1" />
                </>
              )}
              Posted {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
            </div>
            <Badge variant="secondary">{listing.category}</Badge>
          </CardFooter>
        </Card>
      ))}
    </div>;
};

interface StarIconProps {
  className?: string;
}

function StarIcon(props: StarIconProps) {
  return <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={props.className}>
      
    <path
      fillRule="evenodd"
      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.529 1.257 5.27c.271 1.136-.964 2.033-1.96 1.425L12 18.354l-4.335 2.254c-.996.608-2.231-.29-1.96-1.425l1.257-5.27-4.117-3.529c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.005Z"
      clipRule="evenodd" />
  </svg>;
}

export default MarketplaceItemsList;
