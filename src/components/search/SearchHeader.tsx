
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SearchHeaderProps {
  query: string;
  searchQuery: string;
  category: string;
  resultsCount: {
    locations: number;
    events: number;
    marketplace: number;
  };
  loading: boolean;
  error: string | null;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({ 
  query, 
  searchQuery, 
  category,
  resultsCount,
  loading,
  error
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/50 h-96 rounded-xl border border-border/50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {query && query !== searchQuery && (
        <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">AI-enhanced search:</span> {query}
          </p>
        </div>
      )}
      
      <div className="mb-4 flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-xl font-medium">
            <span className="text-primary">{query || searchQuery}</span>
            {category !== 'all' && <span className="ml-2 text-muted-foreground"> in {category}</span>}
          </h1>
        </div>
      </div>
    </>
  );
};

export default SearchHeader;
