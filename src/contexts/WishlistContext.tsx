import React, { createContext, useState, useEffect, useContext } from 'react';
import { Event } from '@/hooks/useRecommendations';

interface WishlistContextProps {
  wishlist: Event[];
  addToWishlist: (event: Event) => void;
  removeFromWishlist: (eventId: string) => void;
}

const WishlistContext = createContext<WishlistContextProps | undefined>(undefined);

interface WishlistProviderProps {
  children: React.ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Event[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    const storedWishlist = localStorage.getItem('wishlist');
    return storedWishlist ? JSON.parse(storedWishlist) : [];
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (event: Event) => {
    setWishlist(prevWishlist => {
      if (prevWishlist.find(item => item.id === event.id)) {
        return prevWishlist;
      }
      return [...prevWishlist, event];
    });
  };

  const removeFromWishlist = (eventId: string) => {
    setWishlist(prevWishlist => prevWishlist.filter(event => event.id !== eventId));
  };

  const value: WishlistContextProps = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
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
