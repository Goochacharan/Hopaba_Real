
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import LocationCard from '@/components/LocationCard';
import { useWishlist } from '@/contexts/WishlistContext';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

const MyList = () => {
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/login');
      } else {
        setUser(data.session.user);
      }
      setLoading(false);
    };
    
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session) {
          navigate('/login');
        } else {
          setUser(session.user);
        }
      }
    );
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = wishlist.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(wishlist.length / itemsPerPage);

  if (loading) {
    return (
      <MainLayout>
        <div className="py-8 flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="py-8">
        <h1 className="text-3xl font-medium mb-6">My Wishlist</h1>
        
        {wishlist.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentItems.map((item) => (
                <LocationCard key={item.id} recommendation={item} />
              ))}
            </div>
            
            {totalPages > 1 && (
              <Pagination className="mt-6">
                <PaginationContent>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(prev => Math.max(prev - 1, 1));
                        }} 
                      />
                    </PaginationItem>
                  )}
                  
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        href="#" 
                        isActive={currentPage === i + 1}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(i + 1);
                        }}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(prev => Math.min(prev + 1, totalPages));
                        }} 
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-border p-8 text-center">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4 stroke-[1.5]" />
            <h2 className="text-xl font-medium mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add items to your wishlist by clicking the heart icon on any location card.
            </p>
            <Button onClick={() => navigate('/')}>
              Explore locations
            </Button>
          </div>
        )}
      </section>
    </MainLayout>
  );
};

export default MyList;
