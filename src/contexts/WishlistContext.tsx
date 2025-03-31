
import React, { createContext, useState, useEffect, useContext } from 'react';

// Define the types that can be added to wishlist
export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  [key: string]: any;
}

export interface Recommendation {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  image: string;
  tags?: string[];
  rating?: number;
  [key: string]: any;
}

export interface MarketplaceListing {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  condition: string;
  [key: string]: any;
}

// Union type for all wishlist items
export type WishlistItem = 
  | (Event & { type: 'event' })
  | (Recommendation & { type: 'location' })
  | (MarketplaceListing & { type: 'marketplace' });

interface WishlistContextProps {
  wishlist: WishlistItem[];
  addToWishlist: (item: Event | Recommendation | MarketplaceListing, type: 'event' | 'location' | 'marketplace') => void;
  removeFromWishlist: (itemId: string, type: 'event' | 'location' | 'marketplace') => void;
  isInWishlist: (itemId: string, type: 'event' | 'location' | 'marketplace') => boolean;
}

const WishlistContext = createContext<WishlistContextProps | undefined>(undefined);

interface WishlistProviderProps {
  children: React.ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    const storedWishlist = localStorage.getItem('wishlist');
    return storedWishlist ? JSON.parse(storedWishlist) : [];
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (item: Event | Recommendation | MarketplaceListing, type: 'event' | 'location' | 'marketplace') => {
    setWishlist(prevWishlist => {
      if (prevWishlist.find(wishlistItem => wishlistItem.id === item.id && wishlistItem.type === type)) {
        return prevWishlist;
      }
      
      // Create a new item with the type property
      const newItem = { ...item, type };
      
      return [...prevWishlist, newItem as WishlistItem];
    });
  };

  const removeFromWishlist = (itemId: string, type: 'event' | 'location' | 'marketplace') => {
    setWishlist(prevWishlist => 
      prevWishlist.filter(item => !(item.id === itemId && item.type === type))
    );
  };

  const isInWishlist = (itemId: string, type: 'event' | 'location' | 'marketplace'): boolean => {
    return wishlist.some(item => item.id === itemId && item.type === type);
  };

  const value: WishlistContextProps = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
