
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

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
  className?: string;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({ 
  query, 
  searchQuery, 
  category,
  resultsCount,
  loading,
  error,
  className
}) => {
  if (loading) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3", className)}>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/50 h-72 rounded-xl border border-border/50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("mb-1", className)}>
      {error && (
        <Alert variant="destructive" className="mb-1 text-xs py-1">
          <AlertCircle className="h-3 w-3" />
          <AlertTitle className="text-xs">Error</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {query && query !== searchQuery && (
        <div className="mb-1 p-1 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">AI-enhanced search:</span> {query}
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchHeader;
