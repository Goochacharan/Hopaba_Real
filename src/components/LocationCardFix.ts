
// This file just exports the correct isInWishlist function to be used with the LocationCard

export const correctIsInWishlist = (id: string, type: string) => {
  // This function will be used to properly call the isInWishlist function with 2 arguments
  
  try {
    // Get wishlist from localStorage
    const storedWishlist = localStorage.getItem('wishlist');
    if (!storedWishlist) return false;
    
    const wishlistItems = JSON.parse(storedWishlist);
    
    // Check if the item exists in the wishlist with the given type
    return wishlistItems.some((item: any) => 
      item.id === id && item.type === type
    );
  } catch (error) {
    console.error("Error checking wishlist:", error);
    return false;
  }
};
