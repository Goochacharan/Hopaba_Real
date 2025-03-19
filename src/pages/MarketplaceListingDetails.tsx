import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { useMarketplaceListing } from '@/hooks/useMarketplaceListings';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Phone, MessageSquare, MapPin, Instagram, Share2, Star, Navigation2, Heart, ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import ImageViewer from '@/components/ImageViewer';
import { Avatar } from '@/components/ui/avatar';

interface MarketplaceListingDetailsProps {}

const formatPrice = (price: number): string => {
  return '₹' + price.toLocaleString('en-IN');
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
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
  
  // Generate a random number of reviews between
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
    const destination = encodeURIComponent(listing.location);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${destination}`;
    window.open(mapsUrl, '_blank');
    toast({
      title: "Opening Directions",
      description: `Getting directions to ${listing.location}...`,
      duration: 2000,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Check out this ${listing.title} for ${formatPrice(listing.price)}`,
        url: window.location.origin + `/marketplace/${listing.id}`,
      }).catch(error => {
        console.log('Error sharing', error);
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/marketplace/${listing.id}`);
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
      description: `${listing.title} ${inWishlist ? "removed from" : "added to"} your wishlist`,
      duration: 2000,
    });
  };

  const renderStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const totalStars = 5;
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="fill-amber-500 stroke-amber-500 w-4 h-4" />
        ))}
        
        {hasHalfStar && (
          <div className="relative w-4 h-4">
            <Star className="absolute stroke-amber-500 w-4 h-4" />
            <div className="absolute overflow-hidden w-[50%]">
              <Star className="fill-amber-500 stroke-amber-500 w-4 h-4" />
            </div>
          </div>
        )}
        
        {[...Array(totalStars - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Star key={`empty-${i}`} className="stroke-amber-500 w-4 h-4" />
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
      <div className="w-full animate-fade-in">
        <div className="container mx-auto py-4">
          <Link 
            to="/marketplace" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Marketplace
          </Link>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column - Images */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
                <Carousel className="w-full">
                  <CarouselContent>
                    {listing.images.map((img, index) => (
                      <CarouselItem key={index} className="p-0">
                        <AspectRatio ratio={16/9}>
                          <img 
                            src={img} 
                            alt={`${listing.title} - image ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => {
                              setSelectedImageIndex(index);
                              setImageViewerOpen(true);
                            }}
                          />
                        </AspectRatio>
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
              
              <div className="mt-6 bg-white rounded-xl border border-border p-6 shadow-sm">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h1 className="text-2xl font-semibold">{listing.title}</h1>
                  <div className="text-2xl font-bold text-[#1EAEDB]">
                    {formatPrice(listing.price)}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-[#1EAEDB]">{listing.condition}</Badge>
                  <Badge variant="outline" className="text-muted-foreground">
                    {listing.category}
                  </Badge>
                  <time className="text-sm text-muted-foreground">
                    Listed {formatDate(listing.created_at)}
                  </time>
                </div>
                
                {/* Seller information */}
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 bg-primary/10 text-primary">
                        <span className="font-medium text-lg">
                          {getInitials(listing.seller_name)}
                        </span>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div>
                          <p className="font-medium">{listing.seller_name}</p>
                          <div className="flex items-center gap-2">
                            {renderStarRating(listing.seller_rating)}
                            <span className="ml-1 text-sm">({listing.seller_rating.toFixed(1)})</span>
                            <span className="text-sm text-muted-foreground">
                              ({reviewCount})
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "flex items-center gap-1.5",
                          inWishlist ? "text-rose-500" : "text-muted-foreground"
                        )}
                        onClick={handleWishlistToggle}
                      >
                        <Heart className={cn("h-4 w-4", inWishlist && "fill-rose-500")} />
                        {inWishlist ? "Saved" : "Save"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="mb-6">
                  <h2 className="text-lg font-medium mb-3">Description</h2>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {listing.description}
                  </p>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-lg font-medium mb-3">Location</h2>
                  <div className="flex items-center text-muted-foreground mb-2">
                    <MapPin className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>{listing.location}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column - Actions */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl border border-border p-5 shadow-sm sticky top-20">
                <h2 className="text-lg font-medium mb-4">Contact Seller</h2>
                
                <div className="space-y-3">
                  {listing.seller_phone && (
                    <Button 
                      onClick={handleCall}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Phone className="h-5 w-5" />
                      Call Seller
                    </Button>
                  )}
                  
                  {listing.seller_whatsapp && (
                    <Button 
                      onClick={handleWhatsApp}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <MessageSquare className="h-5 w-5" />
                      WhatsApp
                    </Button>
                  )}
                  
                  <Separator className="my-4" />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline"
                      onClick={handleLocation}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Navigation2 className="h-5 w-5" />
                      Location
                    </Button>
                    
                    {listing.seller_instagram && (
                      <Button 
                        variant="outline"
                        onClick={handleInstagram}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <Instagram className="h-5 w-5" />
                        Instagram
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline"
                      onClick={handleShare}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Share2 className="h-5 w-5" />
                      Share
                    </Button>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="text-sm text-muted-foreground">
                      <p className="mb-1">Listing ID: {listing.id.slice(0, 8)}</p>
                      <p>Posted on {formatDate(listing.created_at)}</p>
                    </div>
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
