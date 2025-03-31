
export const correctIsInWishlist = (id: string, type: string): boolean => {
  try {
    const wishlistString = localStorage.getItem('wishlist');
    if (!wishlistString) return false;
    
    const wishlist = JSON.parse(wishlistString);
    return wishlist.some((item: any) => item.id === id && item.type === type);
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
};
