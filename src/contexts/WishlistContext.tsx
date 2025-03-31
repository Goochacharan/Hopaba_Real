import React, { createContext, useContext, useEffect, useState } from 'react';
import { Recommendation } from '@/lib/mockData';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import { Event } from '@/hooks/useRecommendations';
import { useToast } from '@/hooks/use-toast';

export type WishlistItem = 
  | (Recommendation & { type: 'location' })
  | (MarketplaceListing & { type: 'marketplace' })
  | (Event & { type: 'event' });

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem | Recommendation | MarketplaceListing | Event) => void;
  removeFromWishlist: (itemId: string, itemType?: 'location' | 'marketplace' | 'event') => void;
  isInWishlist: (itemId: string, itemType?: 'location' | 'marketplace' | 'event') => boolean;
  toggleWishlist: (item: WishlistItem | Recommendation | MarketplaceListing | Event) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const { toast } = useToast();

  // Load wishlist from localStorage on component mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        const parsedWishlist = JSON.parse(savedWishlist);
        setWishlist(parsedWishlist);
      } catch (error) {
        console.error('Error parsing wishlist from localStorage:', error);
        // Reset wishlist on parse error
        localStorage.removeItem('wishlist');
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (item: WishlistItem | Recommendation | MarketplaceListing | Event) => {
    setWishlist(prev => {
      // Ensure item has a type property
      const itemWithType = 'type' in item 
        ? item as WishlistItem
        : {
            ...item,
            type: 'title' in item 
              ? ('attendees' in item ? 'event' : 'marketplace') 
              : 'location'
          } as WishlistItem;
      
      // Check if item already exists in wishlist
      const exists = prev.some(i => i.id === itemWithType.id && i.type === itemWithType.type);
      if (exists) {
        return prev;
      }

      // Show toast notification
      toast({
        title: "Added to wishlist",
        description: getItemTitle(itemWithType) + " has been added to your wishlist.",
        duration: 3000,
      });

      // Add item to wishlist
      return [...prev, itemWithType];
    });
  };

  const removeFromWishlist = (itemId: string, itemType?: 'location' | 'marketplace' | 'event') => {
    setWishlist(prev => {
      const filteredList = itemType
        ? prev.filter(item => !(item.id === itemId && item.type === itemType))
        : prev.filter(item => item.id !== itemId);
      
      // Show toast notification if an item was removed
      if (filteredList.length < prev.length) {
        const removedItem = prev.find(item => 
          itemType ? (item.id === itemId && item.type === itemType) : item.id === itemId
        );
        if (removedItem) {
          toast({
            title: "Removed from wishlist",
            description: getItemTitle(removedItem) + " has been removed from your wishlist.",
            duration: 3000,
          });
        }
      }
      
      return filteredList;
    });
  };

  const toggleWishlist = (item: WishlistItem | Recommendation | MarketplaceListing | Event) => {
    const itemType = 'type' in item 
      ? item.type 
      : ('title' in item 
          ? ('attendees' in item ? 'event' : 'marketplace') 
          : 'location');
          
    const itemExists = isInWishlist(item.id, itemType as 'location' | 'marketplace' | 'event');
    
    if (itemExists) {
      removeFromWishlist(item.id, itemType as 'location' | 'marketplace' | 'event');
    } else {
      addToWishlist(item);
    }
  };

  const isInWishlist = (itemId: string, itemType?: 'location' | 'marketplace' | 'event') => {
    return itemType
      ? wishlist.some(item => item.id === itemId && item.type === itemType)
      : wishlist.some(item => item.id === itemId);
  };

  // Helper function to get the title/name from different item types
  const getItemTitle = (item: WishlistItem): string => {
    if (item.type === 'location') {
      return (item as Recommendation & { type: 'location' }).name;
    } else {
      return (item as (MarketplaceListing | Event) & { type: 'marketplace' | 'event' }).title;
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
