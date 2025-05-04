
import React from 'react';
import { Heart, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  user: any;
  inWishlist: boolean;
  onClick: (e: React.MouseEvent) => void;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  user,
  inWishlist,
  onClick
}) => {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all z-10", 
        user ? (inWishlist ? "text-rose-500" : "text-muted-foreground hover:text-rose-500") : "text-muted-foreground"
      )}
    >
      {user ? (
        <Heart className={cn("w-5 h-5", inWishlist && "fill-rose-500")} />
      ) : (
        <LogIn className="w-5 h-5" />
      )}
    </button>
  );
};

export default WishlistButton;
