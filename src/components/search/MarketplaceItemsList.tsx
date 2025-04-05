
import React, { useEffect, useState } from 'react';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import MarketplaceListingCard from '@/components/MarketplaceListingCard';
import { cn } from '@/lib/utils';
import { Loader2, Tag } from 'lucide-react';
import NoResultsMessage from './NoResultsMessage';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { matchSearchTermsWithTags, improveSearchByTags } from '@/utils/searchUtils';

interface MarketplaceItemsListProps {
  listings: MarketplaceListing[];
  loading?: boolean;
  error?: string | null;
  category?: string;
  searchQuery?: string;
}

const MarketplaceItemsList: React.FC<MarketplaceItemsListProps> = ({ 
  listings,
  loading = false,
  error = null,
  category,
  searchQuery = ''
}) => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const urlSearchQuery = searchParams.get('q') || '';
  const effectiveSearchQuery = searchQuery || urlSearchQuery;
  const [matchedTags, setMatchedTags] = useState<string[]>([]);

  // Filter listings to show approved ones or user's own listings regardless of approval status
  const visibleListings = listings.filter(listing => 
    listing.approval_status === 'approved' || 
    (user && listing.seller_id === user.id)
  );

  useEffect(() => {
    if (effectiveSearchQuery && visibleListings.length > 0) {
      const { tagMatches } = improveSearchByTags(visibleListings, effectiveSearchQuery);
      setMatchedTags(tagMatches);
    } else {
      setMatchedTags([]);
    }
  }, [effectiveSearchQuery, visibleListings]);

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

  // Process natural language search query by removing common connector words
  const processNaturalLanguageQuery = (query: string): string[] => {
    const stopwords = ['in', 'at', 'near', 'around', 'by', 'the', 'a', 'an', 'for', 'with', 'to', 'from', 'and', 'or'];
    let processedQuery = query.replace(/,/g, ' ');
    
    // Get all words with length >= 2 that aren't stopwords
    const words = processedQuery.split(/\s+/).filter(word => 
      word.length >= 2 && !stopwords.includes(word.toLowerCase())
    );
    
    return words;
  };

  // Highlight search terms in listing data if there's a search query
  const highlightSearchTerms = (text: string): React.ReactNode => {
    if (!effectiveSearchQuery || !text) return text;
    
    const searchWords = processNaturalLanguageQuery(effectiveSearchQuery.trim().toLowerCase());
    if (searchWords.length === 0) return text;
    
    // Sort search words by length (longest first) to avoid highlighting issues
    const sortedWords = [...searchWords].sort((a, b) => b.length - a.length);
    
    let result = text;
    sortedWords.forEach(word => {
      if (word.length < 2) return; // Skip very short words
      
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

  // Check if a listing has tags that match the search query
  const hasMatchingTags = (listing: MarketplaceListing): boolean => {
    return matchSearchTermsWithTags(effectiveSearchQuery, listing.tags);
  };

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
          </AlertDescription>
        </Alert>
      )}
      
      {matchedTags.length > 0 && (
        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <Tag className="h-4 w-4 text-blue-600 mr-2" />
          <AlertDescription className="text-blue-800">
            Found matches for tags: {' '}
            {matchedTags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="mr-1 mb-1 bg-blue-100">
                {tag}
              </Badge>
            ))}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleListings.map((listing, index) => (
          <div 
            key={listing.id} 
            className={cn(
              "animate-fade-in h-full relative", 
              "hover:shadow-md transition-shadow duration-300",
              hasMatchingTags(listing) ? "ring-2 ring-amber-300" : "",
              { "animation-delay": `${index * 100}ms` }
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {user && listing.seller_id === user.id && listing.approval_status === 'pending' && (
              <Badge variant="outline" className="absolute top-2 right-2 z-10 bg-yellow-100 text-yellow-800 border-yellow-300">
                Pending Approval
              </Badge>
            )}
            
            {/* Tag match indicator */}
            {hasMatchingTags(listing) && (
              <Badge variant="secondary" className="absolute top-2 left-2 z-10 bg-amber-100 text-amber-800 border-amber-300">
                Tag Match
              </Badge>
            )}
            
            <MarketplaceListingCard 
              listing={{
                ...listing,
                title: effectiveSearchQuery ? 
                  React.isValidElement(highlightSearchTerms(listing.title)) ? 
                    listing.title : 
                    listing.title : 
                  listing.title,
                location: listing.location || "Not specified"
              }} 
              className={cn(
                "h-full flex flex-col",
                "search-result-card", // This class will be used to identify search result cards
                listing.approval_status === 'pending' ? "opacity-75" : ""
              )}
              highlightText={effectiveSearchQuery ? highlightSearchTerms : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketplaceItemsList;
