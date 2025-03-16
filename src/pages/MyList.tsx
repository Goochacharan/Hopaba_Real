
import React from 'react';
import MainLayout from '@/components/MainLayout';
import LocationCard from '@/components/LocationCard';
import { useWishlist } from '@/contexts/WishlistContext';
import { Heart } from 'lucide-react';

const MyList = () => {
  const { wishlist } = useWishlist();

  return (
    <MainLayout>
      <section className="py-8">
        <h1 className="text-3xl font-medium mb-6">My Wishlist</h1>
        
        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <LocationCard key={item.id} recommendation={item} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-border p-8 text-center">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4 stroke-[1.5]" />
            <h2 className="text-xl font-medium mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground">
              Add items to your wishlist by clicking the heart icon on any location card.
            </p>
          </div>
        )}
      </section>
    </MainLayout>
  );
};

export default MyList;
