
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Recommendation } from '@/lib/mockData';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import { Event } from '@/hooks/useRecommendations';

// Use a discriminated union to properly type the wishlist items
export type WishlistItem = 
  | (Recommendation & { type: 'recommendation' })
  | (MarketplaceListing & { type: 'marketplace' })
  | (Event & { type: 'event' });

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: Recommendation | MarketplaceListing | Event, type: 'recommendation' | 'marketplace' | 'event') => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error('Failed to parse wishlist from localStorage:', e);
      }
    }
  }, []);

  // Save wishlist to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (
    item: Recommendation | MarketplaceListing | Event, 
    type: 'recommendation' | 'marketplace' | 'event'
  ) => {
    if (!isInWishlist(item.id)) {
      // Create a properly typed item based on the type parameter
      if (type === 'recommendation') {
        const recommendationItem = item as Recommendation;
        setWishlist((prev) => [...prev, { ...recommendationItem, type }]);
      } else if (type === 'marketplace') {
        const marketplaceItem = item as MarketplaceListing;
        setWishlist((prev) => [...prev, { ...marketplaceItem, type }]);
      } else if (type === 'event') {
        const eventItem = item as Event;
        setWishlist((prev) => [...prev, { ...eventItem, type }]);
      }
    }
  };

  const removeFromWishlist = (id: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  const isInWishlist = (id: string) => {
    return wishlist.some((item) => item.id === id);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
