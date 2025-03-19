import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { useMarketplaceListing } from '@/hooks/useMarketplaceListings';
import { Phone, MessageSquare, MapPin, Instagram, Share2, Star, Calendar, ArrowLeft, Info, Shield, BadgeCheck, AlertCircle, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import ImageViewer from '@/components/ImageViewer';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const formatPrice = (price: number): string => {
  return '₹' + price.toLocaleString('en-IN');
};

const MarketplaceListingDetails = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { listing, loading, error } = useMarketplaceListing(id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [inWishlist, setInWishlist] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title || 'Marketplace Listing',
        text: `Check out this ${listing?.title} for ${listing ? formatPrice(listing.price) : ''}`,
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
    if (listing?.location) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.location)}`);
    }
  };

  const toggleWishlist = () => {
    setInWishlist(!inWishlist);
    
    toast({
      title: inWishlist ? "Removed from wishlist" : "Added to wishlist",
      description: `${listing?.title} ${inWishlist ? "removed from" : "added to"} your wishlist`,
      duration: 2000,
    });
  };

  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };

  const renderStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const totalStars = 5;
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="fill-amber-500 stroke-amber-500 w-3.5 h-3.5" />
        ))}
        
        {hasHalfStar && (
          <div className="relative w-3.5 h-3.5">
            <Star className="absolute stroke-amber-500 w-3.5 h-3.5" />
            <div className="absolute overflow-hidden w-[50%]">
              <Star className="fill-amber-500 stroke-amber-500 w-3.5 h-3.5" />
            </div>
          </div>
        )}
        
        {[...Array(totalStars - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Star key={`empty-${i}`} className="stroke-amber-500 w-3.5 h-3.5" />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4 max-w-6xl animate-pulse">
          <div className="mb-8 h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-1 lg:col-span-2">
              <div className="h-[450px] bg-gray-200 rounded-xl mb-4"></div>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
            <div className="col-span-1">
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-4 w-1/2"></div>
              <div className="h-40 bg-gray-200 rounded mb-6"></div>
              <div className="h-12 bg-gray-200 rounded mb-2"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !listing) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4 max-w-6xl">
          <Link to="/marketplace" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Marketplace</span>
          </Link>
          
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || "Failed to load listing details"}</AlertDescription>
          </Alert>
          
          <Button asChild>
            <Link to="/marketplace">Browse other listings</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const createdDate = new Date(listing.created_at);

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <Link to="/marketplace" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Marketplace</span>
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-1 lg:col-span-2">
            <div className="mb-6">
              <Badge className="mb-2">{listing?.category}</Badge>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{listing?.title}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{listing?.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Listed on {listing ? format(new Date(listing.created_at), 'PPP') : ''}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="flex items-center gap-1 text-amber-600 bg-amber-50">
                    <BadgeCheck className="h-3 w-3" />
                    <span>{listing?.condition}</span>
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="mb-6 bg-black/5 p-4 rounded-xl shadow-sm">
              <Carousel className="w-full">
                <CarouselContent>
                  {listing?.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div 
                        className="relative overflow-hidden rounded-lg cursor-pointer w-full"
                        onClick={() => openImageViewer(index)}
                      >
                        <AspectRatio ratio={16/9} className="bg-muted">
                          <img 
                            src={image || '/placeholder.svg'} 
                            alt={`${listing.title} - image ${index + 1}`}
                            className="w-full h-full object-cover bg-black/5"
                          />
                        </AspectRatio>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
              
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 mt-4">
                {listing?.images.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      openImageViewer(index);
                    }}
                    className={`cursor-pointer rounded-lg overflow-hidden transition-all border-2 ${
                      selectedImageIndex === index ? 'border-[#1EAEDB] shadow-md' : 'border-transparent'
                    }`}
                  >
                    <AspectRatio ratio={1/1} className="bg-muted">
                      <img
                        src={image || '/placeholder.svg'}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </AspectRatio>
                  </div>
                ))}
              </div>
            </div>
            
            {listing && (
              <ImageViewer 
                images={listing.images} 
                initialIndex={selectedImageIndex}
                open={imageViewerOpen}
                onOpenChange={setImageViewerOpen}
              />
            )}
            
            <div className="mb-8 bg-white rounded-xl border p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground whitespace-pre-line">{listing?.description}</p>
                
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-y-3">
                    <div className="text-sm font-medium">Category</div>
                    <div className="text-sm text-muted-foreground">{listing?.category}</div>
                    
                    <div className="text-sm font-medium">Condition</div>
                    <div className="text-sm text-muted-foreground">{listing?.condition}</div>
                    
                    <div className="text-sm font-medium">Location</div>
                    <div className="text-sm text-muted-foreground">{listing?.location}</div>
                    
                    <div className="text-sm font-medium">Listed on</div>
                    <div className="text-sm text-muted-foreground">{listing ? format(new Date(listing.created_at), 'PPP') : ''}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-xl border p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-[#1EAEDB]">
                      {listing ? formatPrice(listing.price) : ''}
                    </h2>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="font-medium">{listing?.seller_name}</p>
                    <div className="flex items-center gap-1">
                      {listing && renderStarRating(listing.seller_rating)}
                      <span className="text-xs text-muted-foreground ml-1">(24)</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <Button onClick={handleCall} className="w-full gap-2 bg-[#1EAEDB] hover:bg-[#1EAEDB]/90 rounded-full">
                    <Phone className="h-5 w-5" />
                    Contact Seller
                  </Button>
                  
                  <Button variant="outline" onClick={handleWhatsApp} className="w-full gap-2 text-gray-700 rounded-full">
                    <MessageSquare className="h-5 w-5" />
                    WhatsApp
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleLocation} 
                    className="w-full h-12 flex justify-center items-center text-gray-700 rounded-full"
                    title="Location"
                    aria-label="View location"
                  >
                    <MapPin className="h-5 w-5" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleInstagram} 
                    className="w-full h-12 flex justify-center items-center text-gray-700 rounded-full"
                    title="Instagram"
                    aria-label="View Instagram profile"
                  >
                    <Instagram className="h-5 w-5" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleShare} 
                    className="w-full h-12 flex justify-center items-center text-gray-700 rounded-full"
                    title="Share"
                    aria-label="Share listing"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex justify-end mt-4">
                  <button 
                    onClick={toggleWishlist}
                    className={`p-2 rounded-full transition-colors ${inWishlist ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'}`}
                  >
                    <Heart className={`w-5 h-5 ${inWishlist && 'fill-rose-500'}`} />
                  </button>
                </div>
              </div>
              
              <div className="bg-[#1EAEDB]/5 rounded-xl p-4 border border-[#1EAEDB]/10">
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-[#1EAEDB]/70 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm mb-1">Safe trading tips</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Meet in a public place</li>
                      <li>• Verify the item before paying</li>
                      <li>• Pay only after inspecting the item</li>
                      <li>• Don't share personal financial information</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MarketplaceListingDetails;
