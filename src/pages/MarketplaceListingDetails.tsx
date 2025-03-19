
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { useMarketplaceListing } from '@/hooks/useMarketplaceListings';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Phone, MessageSquare, MapPin, Instagram, Share2, Star, Navigation2, Heart, ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import ImageViewer from '@/components/ImageViewer';
import { Avatar } from '@/components/ui/avatar';

const formatPrice = (price: number): string => {
  return '₹' + price.toLocaleString('en-IN');
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

const getInitials = (name: string): string => {
  const nameParts = name.split(' ');
  const initials = nameParts.map((part) => part.charAt(0).toUpperCase()).join('');
  return initials;
};

const MarketplaceListingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { listing, loading, error } = useMarketplaceListing(id || '');
  const { toast } = useToast();
  const [inWishlist, setInWishlist] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Generate a random number of reviews
  const reviewCount = React.useMemo(() => Math.floor(Math.random() * 150) + 50, []);

  const handleCall = () => {
    if (listing?.seller_phone) {
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
    if (listing?.seller_whatsapp) {
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
    if (listing?.seller_instagram) {
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
    const destination = encodeURIComponent(listing?.location || '');
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${destination}`;
    window.open(mapsUrl, '_blank');
    toast({
      title: "Opening Directions",
      description: `Getting directions to ${listing?.location}...`,
      duration: 2000,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title || '',
        text: `Check out this ${listing?.title} for ${formatPrice(listing?.price || 0)}`,
        url: window.location.origin + `/marketplace/${listing?.id}`,
      }).catch(error => {
        console.log('Error sharing', error);
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/marketplace/${listing?.id}`);
      toast({
        title: "Link copied to clipboard",
        description: "You can now share this listing with others",
        duration: 3000,
      });
    }
  };

  const handleWishlistToggle = () => {
    setInWishlist(!inWishlist);
    toast({
      title: inWishlist ? "Removed from wishlist" : "Added to wishlist",
      description: `${listing?.title} ${inWishlist ? "removed from" : "added to"} your wishlist`,
      duration: 2000,
    });
  };

  const renderStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const totalStars = 5;
    
    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="fill-amber-500 stroke-amber-500 w-5 h-5" />
        ))}
        
        {hasHalfStar && (
          <div className="relative w-5 h-5">
            <Star className="absolute stroke-amber-500 w-5 h-5" />
            <div className="absolute overflow-hidden w-[50%]">
              <Star className="fill-amber-500 stroke-amber-500 w-5 h-5" />
            </div>
          </div>
        )}
        
        {[...Array(totalStars - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Star key={`empty-${i}`} className="stroke-amber-500 w-5 h-5" />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-80 bg-muted/50 rounded-xl"></div>
            <div className="h-10 w-2/3 bg-muted/50 rounded-lg"></div>
            <div className="h-20 bg-muted/50 rounded-lg"></div>
            <div className="h-40 bg-muted/50 rounded-lg"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !listing) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <div className="bg-destructive/10 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-destructive">Error Loading Listing</h2>
            <p className="text-muted-foreground">{error || 'Listing not found'}</p>
            <Link to="/marketplace" className="text-primary hover:underline mt-2 inline-block">
              Return to Marketplace
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full bg-background min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <Link 
            to="/marketplace" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Marketplace
          </Link>
          
          {/* Main content */}
          <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="p-6">
              {/* Title and price section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">{listing.title}</h1>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge className="bg-[#1EAEDB] text-white">
                      {listing.condition}
                    </Badge>
                    <Badge variant="outline" className="text-muted-foreground">
                      {listing.category}
                    </Badge>
                  </div>
                </div>
                <div className="text-3xl font-bold text-[#1EAEDB]">
                  {formatPrice(listing.price)}
                </div>
              </div>
              
              {/* Date listed */}
              <div className="mb-6 text-muted-foreground">
                Listed {formatDate(listing.created_at)}
              </div>
              
              {/* Seller information */}
              <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 bg-blue-100 text-blue-600">
                    <span className="font-medium text-xl">
                      {getInitials(listing.seller_name)}
                    </span>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-1">{listing.seller_name}</h2>
                    <div className="flex items-center gap-2">
                      {renderStarRating(listing.seller_rating)}
                      <span className="text-gray-600 ml-1">
                        ({reviewCount})
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    className={cn(
                      "flex items-center gap-2",
                      inWishlist ? "text-rose-500" : "text-muted-foreground"
                    )}
                    onClick={handleWishlistToggle}
                  >
                    <Heart className={cn("h-5 w-5", inWishlist && "fill-rose-500")} />
                    Save
                  </Button>
                </div>
              </div>
              
              {/* Images carousel */}
              <div className="mb-8">
                <Carousel className="w-full">
                  <CarouselContent>
                    {listing.images.map((img, index) => (
                      <CarouselItem key={index} className="p-0">
                        <div 
                          className="relative aspect-[16/9] rounded-xl overflow-hidden"
                          onClick={() => {
                            setSelectedImageIndex(index);
                            setImageViewerOpen(true);
                          }}
                        >
                          <img 
                            src={img} 
                            alt={`${listing.title} - image ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {listing.images.length > 1 && (
                    <>
                      <CarouselPrevious className="left-2" />
                      <CarouselNext className="right-2" />
                    </>
                  )}
                </Carousel>
              </div>
              
              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Description</h2>
                <p className="text-muted-foreground whitespace-pre-line">
                  {listing.description}
                </p>
              </div>
              
              {/* Location */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Location</h2>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-5 h-5 flex-shrink-0" />
                  <span>{listing.location}</span>
                </div>
              </div>
              
              {/* Contact buttons */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">Contact Seller</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listing.seller_phone && (
                    <Button 
                      onClick={handleCall}
                      size="lg"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Phone className="h-5 w-5 mr-2" />
                      Call Seller
                    </Button>
                  )}
                  
                  {listing.seller_whatsapp && (
                    <Button 
                      onClick={handleWhatsApp}
                      size="lg"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <MessageSquare className="h-5 w-5 mr-2" />
                      WhatsApp
                    </Button>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline"
                    size="lg"
                    onClick={handleLocation}
                    className="w-full"
                  >
                    <Navigation2 className="h-5 w-5 mr-2" />
                    Location
                  </Button>
                  
                  {listing.seller_instagram && (
                    <Button 
                      variant="outline"
                      size="lg"
                      onClick={handleInstagram}
                      className="w-full"
                    >
                      <Instagram className="h-5 w-5 mr-2" />
                      Instagram
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline"
                    size="lg"
                    onClick={handleShare}
                    className="w-full"
                  >
                    <Share2 className="h-5 w-5 mr-2" />
                    Share
                  </Button>
                </div>
                
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    <p>Listing ID: {listing.id.slice(0, 8)}</p>
                    <p>Posted on {formatDate(listing.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ImageViewer 
        images={listing.images} 
        initialIndex={selectedImageIndex}
        open={imageViewerOpen}
        onOpenChange={setImageViewerOpen}
      />
    </MainLayout>
  );
};

export default MarketplaceListingDetails;
