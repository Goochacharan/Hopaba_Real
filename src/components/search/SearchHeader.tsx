
import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import { cn } from '@/lib/utils';
import { CategoryType } from '@/components/CategoryFilter';

interface SearchHeaderProps {
  query: string;
  searchQuery: string;
  category: CategoryType;
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
  const navigate = useNavigate();
  
  const handleSearch = (newQuery: string) => {
    console.log('New search from header:', newQuery);
    navigate(`/search?q=${encodeURIComponent(newQuery)}`);
  };
  
  return (
    <div className={cn("w-full sticky top-0 bg-background z-20 py-2 px-2", className)}>
      <SearchBar 
        onSearch={handleSearch} 
        initialValue={searchQuery || query} 
        placeholder="Search again..." 
        className="max-w-md mx-auto"
      />
      {!loading && !error && (
        <div className="text-sm text-muted-foreground mt-2 text-center">
          <span className="font-semibold">{resultsCount.locations + resultsCount.events + resultsCount.marketplace}</span> results for &quot;{query}&quot;
          {category !== 'all' && <span> in <span className="font-medium capitalize">{category}</span></span>}
        </div>
      )}
    </div>
  );
};

export default SearchHeader;
