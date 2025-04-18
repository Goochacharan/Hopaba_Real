
import React, { useRef } from 'react';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import MarketplaceListingCard from '@/components/MarketplaceListingCard';
import { cn } from '@/lib/utils';
import { MapPin } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface MarketplaceGridProps {
  listings: MarketplaceListing[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  highlightedListingId?: string;
}

const MarketplaceGrid = ({
  listings,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  highlightedListingId
}: MarketplaceGridProps) => {
  const highlightedListingRef = useRef<HTMLDivElement>(null);
  const totalPages = Math.ceil(listings.length / itemsPerPage);
  const paginatedListings = listings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  React.useEffect(() => {
    if (highlightedListingRef.current) {
      highlightedListingRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [highlightedListingId]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedListings.map((listing, index) => (
          <div
            key={listing.id}
            ref={listing.id === highlightedListingId ? highlightedListingRef : null}
            className={cn(
              "transition-all duration-300",
              listing.id === highlightedListingId ? "ring-4 ring-primary ring-opacity-50" : ""
            )}
          >
            <MarketplaceListingCard
              listing={listing}
              className="relative"
            />
            {listing.distance !== undefined && (
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{listing.distance.toFixed(1)} km</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => setCurrentPage(index + 1)}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
};

export default MarketplaceGrid;
