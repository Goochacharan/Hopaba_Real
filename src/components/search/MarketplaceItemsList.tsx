
import React, { useEffect, useState } from 'react';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import MarketplaceListingCard from '@/components/MarketplaceListingCard';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import NoResultsMessage from './NoResultsMessage';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface MarketplaceItemsListProps {
  listings: MarketplaceListing[];
  loading?: boolean;
  error?: string | null;
  category?: string;
}

const MarketplaceItemsList: React.FC<MarketplaceItemsListProps> = ({ 
  listings,
  loading = false,
  error = null,
  category
}) => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  console.log(`MarketplaceItemsList received ${listings.length} listings`);
  console.log('Raw listings:', listings.map(l => `${l.title} (${l.category}) - ${l.approval_status}`));

  // Filter listings to show approved ones or user's own listings regardless of approval status
  const visibleListings = listings.filter(listing => 
    listing.approval_status === 'approved' || 
    (user && listing.seller_id === user.id)
  );

  // Process natural language search query by removing common connector words
  const processNaturalLanguageQuery = (query: string): string[] => {
    const stopwords = ['in', 'at', 'near', 'around', 'by', 'the', 'a', 'an', 'for', 'with', 'to', 'from', 'and', 'or'];
    let processedQuery = query.replace(/,/g, ' ');
    
    // Get all words with length >= 3 that aren't stopwords
    const words = processedQuery.split(/\s+/).filter(word => 
      word.length >= 3 && !stopwords.includes(word.toLowerCase())
    );
    
    console.log('Search terms after processing:', words);
    return words;
  };

  // Highlight search terms in listing data if there's a search query
  const highlightSearchTerms = (text: string): React.ReactNode => {
    if (!searchQuery || !text) return text;
    
    const searchWords = processNaturalLanguageQuery(searchQuery.trim().toLowerCase());
    if (searchWords.length === 0) return text;
    
    // Sort search words by length (longest first) to avoid highlighting issues
    const sortedWords = [...searchWords].sort((a, b) => b.length - a.length);
    
    let result = text;
    sortedWords.forEach(word => {
      if (word.length < 3) return; // Skip very short words
      
      // Case insensitive replacement with word boundary awareness when possible
      const regex = new RegExp(`(\\b${word}|${word})`, 'gi');
      result = result.replace(regex, '<mark>$1</mark>');
    });
    
    const parts = result.split(/(<mark>.*?<\/mark>)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('<mark>') && part.endsWith('</mark>')) {
        const content = part.replace(/<\/?mark>/g, '');
        return <span key={i} className="bg-yellow-200 text-gray-900 rounded px-0.5">{content}</span>;
      }
      return part;
    });
  };

  // Check if listing matches any search terms by tag
  const matchesByTag = (listing: MarketplaceListing): boolean => {
    if (!searchQuery || !listing.tags || !Array.isArray(listing.tags)) return false;
    
    const searchWords = processNaturalLanguageQuery(searchQuery.trim().toLowerCase());
    if (searchWords.length === 0) return false;

    return searchWords.some(word => 
      listing.tags?.some(tag => tag.toLowerCase().includes(word.toLowerCase()))
    );
  };

  console.log(`After filtering, ${visibleListings.length} listings are visible`);
  console.log('Visible listings:', visibleListings.map(l => `${l.title} (${l.category}) - ${l.approval_status}`));

  if (visibleListings.length === 0) {
    return <NoResultsMessage type="marketplace" />;
  }

  return (
    <div className="space-y-4 pb-24">
      {visibleListings.some(l => l.approval_status === 'pending' && user && l.seller_id === user.id) && (
        <Alert variant="default" className="bg-yellow-50 border-yellow-200">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Some of your listings are pending admin approval and are only visible to you.
            {visibleListings.some(l => l.title.toLowerCase().includes('honda') && l.title.toLowerCase().includes('wrv')) && (
              <span className="block mt-1 font-medium">Your Honda WRV listing will appear after approval.</span>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleListings.map((listing, index) => (
          <div 
            key={listing.id} 
            className="animate-fade-in h-full relative" 
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {user && listing.seller_id === user.id && listing.approval_status === 'pending' && (
              <Badge variant="outline" className="absolute top-2 right-2 z-10 bg-yellow-100 text-yellow-800 border-yellow-300">
                Pending Approval
              </Badge>
            )}
            {searchQuery && matchesByTag(listing) && (
              <Badge variant="outline" className="absolute top-2 left-2 z-10 bg-green-100 text-green-800 border-green-300">
                Matches Tag
              </Badge>
            )}
            <MarketplaceListingCard 
              listing={{
                ...listing,
                title: searchQuery ? 
                  React.isValidElement(highlightSearchTerms(listing.title)) ? 
                    listing.title : 
                    listing.title : 
                  listing.title,
                location: listing.location || "Not specified"
              }} 
              className={cn(
                "h-full flex flex-col",
                "search-result-card", // This class will be used to identify search result cards
                listing.approval_status === 'pending' ? "opacity-75" : "",
                searchQuery && matchesByTag(listing) ? "border-green-400 border-2" : ""
              )}
              highlightText={searchQuery ? highlightSearchTerms : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketplaceItemsList;
