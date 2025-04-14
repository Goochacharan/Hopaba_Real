
import React from 'react';
import { Heart } from 'lucide-react';
import LocationCard from '@/components/LocationCard';
import MarketplaceListingCard from '@/components/MarketplaceListingCard';
import EventCard from '@/components/EventCard';

interface WishlistContentProps {
  wishlist: any[];
  toggleWishlist: (item: any) => void;
}

const WishlistContent: React.FC<WishlistContentProps> = ({ wishlist, toggleWishlist }) => {
  if (wishlist.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Heart className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-lg">Your wishlist is empty</h3>
        <p className="text-muted-foreground">
          Add items to your wishlist by clicking the heart icon on any location card or marketplace listing.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wishlist.map(item => {
        if (item.type === 'marketplace') {
          return (
            <div key={item.id} className="relative group">
              <MarketplaceListingCard listing={item} className="search-result-card" />
              <button
                className="absolute top-2 right-2 p-2 rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all z-10 text-rose-500"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(item);
                }}
              >
                <Heart className="h-4 w-4 fill-rose-500" />
              </button>
            </div>
          );
        } else if (item.type === 'event') {
          return (
            <div key={item.id} className="relative group">
              <EventCard event={item} className="search-result-card" />
              <button
                className="absolute top-2 right-2 p-2 rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all z-10 text-rose-500"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(item);
                }}
              >
                <Heart className="h-4 w-4 fill-rose-500" />
              </button>
            </div>
          );
        } else {
          return (
            <div key={item.id} className="relative group">
              <LocationCard recommendation={item} className="search-result-card" />
              <button
                className="absolute top-2 right-2 p-2 rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all z-10 text-rose-500"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(item);
                }}
              >
                <Heart className="h-4 w-4 fill-rose-500" />
              </button>
            </div>
          );
        }
      })}
    </div>
  );
};

export default WishlistContent;
