
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { useMarketplaceListing } from '@/hooks/useMarketplaceListings';
import { Phone, MessageSquare, MapPin, Instagram, Share2, Star, Calendar, ArrowLeft, Info, Shield, BadgeCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';

const formatPrice = (price: number): string => {
  return '₹' + price.toLocaleString('en-IN');
};

const MarketplaceListingDetails = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { listing, loading, error } = useMarketplaceListing(id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
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

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 max-w-5xl animate-pulse">
          <div className="mb-8 h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-1 lg:col-span-2">
              <div className="h-96 bg-gray-200 rounded mb-4"></div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
        <div className="container mx-auto py-8 max-w-5xl">
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
      <div className="container mx-auto py-8 max-w-5xl">
        <Link to="/marketplace" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Marketplace</span>
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-1 lg:col-span-2">
            <div className="mb-6">
              <Badge className="mb-2">{listing.category}</Badge>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{listing.title}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Listed on {format(createdDate, 'PPP')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="flex items-center gap-1 text-amber-600 bg-amber-50">
                    <BadgeCheck className="h-3 w-3" />
                    <span>{listing.condition}</span>
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="mb-6 bg-black/5 p-1 rounded-xl">
              <Carousel className="w-full">
                <CarouselContent>
                  {listing.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="relative rounded-lg overflow-hidden h-[300px] sm:h-[400px] md:h-[500px]">
                        <img 
                          src={image || '/placeholder.svg'} 
                          alt={`${listing.title} - image ${index + 1}`}
                          className="w-full h-full object-contain bg-black/5"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
              
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-2">
                {listing.images.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`cursor-pointer rounded-md overflow-hidden h-16 sm:h-20 border-2 transition-all ${
                      selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image || '/placeholder.svg'}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground whitespace-pre-line">{listing.description}</p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Details</h2>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Category</TableCell>
                    <TableCell>{listing.category}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Condition</TableCell>
                    <TableCell>{listing.condition}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Location</TableCell>
                    <TableCell>{listing.location}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Listed</TableCell>
                    <TableCell>{format(createdDate, 'PPP')}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-xl border p-6 shadow-sm">
                <div className="mb-4">
                  <h2 className="text-3xl font-bold text-primary">
                    {formatPrice(listing.price)}
                  </h2>
                </div>
                
                <div className="space-y-3 mb-6">
                  <Button onClick={handleCall} className="w-full gap-2">
                    <Phone className="h-4 w-4" />
                    Contact Seller
                  </Button>
                  
                  <Button variant="outline" onClick={handleWhatsApp} className="w-full gap-2">
                    <MessageSquare className="h-4 w-4" />
                    WhatsApp
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleLocation} className="flex-1 gap-1">
                    <MapPin className="h-4 w-4" />
                    Location
                  </Button>
                  
                  <Button variant="outline" onClick={handleInstagram} className="flex-1 gap-1">
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </Button>
                  
                  <Button variant="outline" onClick={handleShare} className="flex-1 gap-1">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Seller Information</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center text-primary font-semibold">
                    {listing.seller_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{listing.seller_name}</p>
                    <div className="flex items-center gap-1 text-sm text-amber-500">
                      <Star className="h-3 w-3 fill-amber-500" />
                      <span>{listing.seller_rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-primary/70 shrink-0 mt-0.5" />
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
