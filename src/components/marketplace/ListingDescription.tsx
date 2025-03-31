
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { Phone, MessageSquare, Instagram, MapPin, CircleDollarSign, ShoppingBag, Tag, Info, Calendar, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import ReactMarkdown from 'react-markdown';
import ImageGallery from '../ImageGallery';
import SellerReviews from './SellerReviews';
import ReviewForm from './ReviewForm';

// Helper functions to safely process availability_days
const isValidAvailabilityDays = (days: any): days is string[] => {
  return Array.isArray(days) && days.length > 0;
};

const isValidAvailabilityDaysString = (days: any): days is string => {
  return typeof days === 'string' && days.trim().length > 0;
};

interface ListingDescriptionProps {
  listing: MarketplaceListing;
  sellerReviews?: any[];
  onReviewSubmit?: (rating: number, comment: string) => Promise<void>;
  isReviewSubmitting?: boolean;
  currentUserReviewed?: boolean;
  refetchReviews?: () => void;
}

const ListingDescription: React.FC<ListingDescriptionProps> = ({
  listing,
  sellerReviews = [],
  onReviewSubmit,
  isReviewSubmitting = false,
  currentUserReviewed = false,
  refetchReviews
}) => {
  const [activeTab, setActiveTab] = useState('details');
  
  const formatCondition = (condition: string) => {
    return condition.charAt(0).toUpperCase() + condition.slice(1);
  };
  
  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  };
  
  const timeAgo = formatTimeAgo(listing.created_at);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge className="px-2 py-1">
                {listing.category.charAt(0).toUpperCase() + listing.category.slice(1)}
              </Badge>
              <span className="text-sm text-muted-foreground">{timeAgo}</span>
            </div>
            
            <h1 className="text-2xl font-bold">{listing.title}</h1>
            
            <div className="flex flex-wrap gap-4 py-2">
              <div className="flex items-center gap-1.5">
                <CircleDollarSign className="h-5 w-5 text-green-600" />
                <span className="text-xl font-semibold">₹{listing.price.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <ShoppingBag className="h-5 w-5 text-amber-500" />
                <span className="text-sm">
                  Condition: <span className="font-medium">{formatCondition(listing.condition)}</span>
                </span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <MapPin className="h-5 w-5 text-blue-500" />
                <span className="text-sm">{listing.location}</span>
              </div>
              
              {listing.seller_rating && (
                <div className="flex items-center gap-1.5">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm">
                    <span className="font-medium">{listing.seller_rating}</span>/5
                    {listing.review_count && (
                      <span className="text-muted-foreground ml-1">
                        ({listing.review_count} {listing.review_count === 1 ? 'review' : 'reviews'})
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="details" className="text-sm">
                <Info className="mr-2 h-4 w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="seller" className="text-sm">
                <Star className="mr-2 h-4 w-4" />
                Seller ({sellerReviews.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-4 space-y-6">
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Description</h2>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>
                        {listing.description}
                      </ReactMarkdown>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {listing.images && listing.images.length > 0 && (
                <Card>
                  <CardContent className="p-4 md:p-6">
                    <h2 className="text-lg font-semibold mb-4">Images</h2>
                    <ImageGallery images={listing.images} />
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="seller" className="mt-4 space-y-6">
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">About the Seller</h2>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {listing.seller_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{listing.seller_name}</p>
                        {listing.seller_rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{listing.seller_rating}/5</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <SellerReviews 
                reviews={sellerReviews} 
                sellerName={listing.seller_name} 
              />
              
              {!currentUserReviewed && onReviewSubmit && (
                <ReviewForm 
                  onSubmit={onReviewSubmit} 
                  isSubmitting={isReviewSubmitting} 
                  sellerName={listing.seller_name}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4 md:p-6">
              <h2 className="text-lg font-semibold mb-4">Contact Seller</h2>
              <div className="space-y-3">
                {listing.seller_phone && (
                  <a href={`tel:${listing.seller_phone}`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="mr-2 h-4 w-4" />
                      Call Seller
                    </Button>
                  </a>
                )}
                
                {listing.seller_whatsapp && (
                  <a 
                    href={`https://wa.me/${listing.seller_whatsapp.replace(/\+/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="mr-2 h-4 w-4 text-green-600" />
                      WhatsApp
                    </Button>
                  </a>
                )}
                
                {listing.seller_instagram && (
                  <a 
                    href={
                      listing.seller_instagram.startsWith('@') 
                        ? `https://instagram.com/${listing.seller_instagram.slice(1)}` 
                        : listing.seller_instagram.includes('instagram.com') 
                          ? listing.seller_instagram 
                          : `https://instagram.com/${listing.seller_instagram}`
                    } 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full justify-start">
                      <Instagram className="mr-2 h-4 w-4 text-pink-600" />
                      Instagram / Video
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
          
          {listing.map_link && (
            <Card>
              <CardContent className="p-4 md:p-6">
                <h2 className="text-lg font-semibold mb-4">Location</h2>
                <a 
                  href={listing.map_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="mr-2 h-4 w-4 text-red-500" />
                    View on Map
                  </Button>
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingDescription;
