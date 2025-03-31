
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon, 
  MapPinIcon, 
  TagIcon, 
  UserIcon, 
  PhoneIcon, 
  MessageSquare,
  Instagram,
  Clock,
  Share2 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ImageGallery from '../ImageGallery';
import { formatPhoneNumber } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  category: string;
  images: string[];
  created_at: string;
  seller_name: string;
  seller_id: string;
  seller_phone?: string;
  seller_whatsapp?: string;
  seller_instagram?: string;
  location: string;
  map_link?: string;
}

interface SellerReview {
  id: string;
  rating: number;
  comment: string;
  reviewer_name: string;
  created_at: string;
}

interface SellerReviewsProps {
  reviews: SellerReview[];
  sellerName: string;
  sellerId: string;
  onAddReview: (review: { rating: number; comment: string }) => Promise<void>;
}

interface ListingMetadataProps {
  category: string;
  condition: string;
  location: string;
  createdAt: string;
  instagram?: string;
}

interface ListingDescriptionProps {
  listing: Listing;
  reviews: SellerReview[];
  onAddReview: (review: { rating: number; comment: string }) => Promise<void>;
  showMetadata?: boolean;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

const SellerReviews: React.FC<SellerReviewsProps> = ({ 
  reviews, 
  sellerName, 
  sellerId,
  onAddReview 
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmitReview = async () => {
    setIsSubmitting(true);
    try {
      await onAddReview({ rating, comment });
      setComment('');
      setRating(5);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Reviews for {sellerName}</h3>
      
      {reviews.length === 0 ? (
        <p className="text-muted-foreground">No reviews yet for this seller.</p>
      ) : (
        <div className="space-y-4 mb-6">
          {reviews.map(review => (
            <Card key={review.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">{review.reviewer_name}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-lg ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-2">{review.comment}</p>
            </Card>
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <h4 className="font-medium mb-2">Add Your Review</h4>
        <div className="flex mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              className="text-2xl focus:outline-none"
            >
              <span className={`${i < rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                ★
              </span>
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-2 border rounded-md mb-2 min-h-[100px]"
          placeholder="Share your experience with this seller..."
        />
        <Button 
          onClick={handleSubmitReview} 
          disabled={!comment.trim() || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </div>
    </div>
  );
};

const ListingMetadata: React.FC<ListingMetadataProps> = ({ 
  category, 
  condition, 
  location, 
  createdAt,
  instagram
}) => {
  return (
    <div className="flex flex-wrap gap-3 mt-4">
      <Badge variant="outline" className="flex items-center gap-1">
        <TagIcon className="h-3 w-3" />
        {category}
      </Badge>
      
      <Badge variant="outline" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {condition}
      </Badge>
      
      <Badge variant="outline" className="flex items-center gap-1">
        <MapPinIcon className="h-3 w-3" />
        {location}
      </Badge>
      
      <Badge variant="outline" className="flex items-center gap-1">
        <CalendarIcon className="h-3 w-3" />
        {formatDate(createdAt)}
      </Badge>
      
      {instagram && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Instagram className="h-3 w-3" />
          {instagram}
        </Badge>
      )}
    </div>
  );
};

const ListingDescription: React.FC<ListingDescriptionProps> = ({ 
  listing, 
  reviews, 
  onAddReview,
  showMetadata = true
}) => {
  const { toast } = useToast();
  
  const handleShareListing = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Check out this listing: ${listing.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Listing link copied to clipboard",
      });
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold">{listing.title}</h1>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleShareListing}
            className="flex items-center gap-1"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
        <div className="mt-2 text-2xl font-semibold">₹{listing.price.toLocaleString()}</div>
      </div>
      
      <ImageGallery images={listing.images} className="mb-6" />
      
      {showMetadata && (
        <ListingMetadata 
          category={listing.category}
          condition={listing.condition}
          location={listing.location}
          createdAt={listing.created_at}
          instagram={listing.seller_instagram}
        />
      )}
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Description</h2>
        <div className="prose max-w-none">
          <ReactMarkdown>{listing.description}</ReactMarkdown>
        </div>
      </div>
      
      <div className="mt-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Seller Information</h2>
        <div className="space-y-3">
          <div className="flex items-center">
            <UserIcon className="h-5 w-5 mr-2 text-muted-foreground" />
            <span>{listing.seller_name}</span>
          </div>
          
          {listing.seller_phone && (
            <div className="flex items-center">
              <PhoneIcon className="h-5 w-5 mr-2 text-muted-foreground" />
              <a href={`tel:${listing.seller_phone}`} className="text-blue-600 hover:underline">
                {formatPhoneNumber(listing.seller_phone)}
              </a>
            </div>
          )}
          
          {listing.seller_whatsapp && (
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-muted-foreground" />
              <a 
                href={`https://wa.me/${listing.seller_whatsapp.replace(/\+/g, '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                WhatsApp {formatPhoneNumber(listing.seller_whatsapp)}
              </a>
            </div>
          )}
          
          {listing.seller_instagram && (
            <div className="flex items-center">
              <Instagram className="h-5 w-5 mr-2 text-muted-foreground" />
              <a 
                href={`https://instagram.com/${listing.seller_instagram.replace('@', '')}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {listing.seller_instagram}
              </a>
            </div>
          )}
          
          {listing.map_link && (
            <div className="flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2 text-muted-foreground" />
              <a 
                href={listing.map_link}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View on map
              </a>
            </div>
          )}
        </div>
      </div>
      
      <SellerReviews 
        reviews={reviews} 
        sellerName={listing.seller_name}
        sellerId={listing.seller_id}
        onAddReview={onAddReview}
      />
    </div>
  );
};

export default ListingDescription;
