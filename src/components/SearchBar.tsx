
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, MapPin, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  className?: string;
  placeholder?: string;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  className, 
  placeholder = "Try 'suggest me a good unisex salon near me'", 
  initialValue = '' 
}) => {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const detectLocation = () => {
    if ('geolocation' in navigator) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation('Using your current location');
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocation(null);
          setLocationLoading(false);
        }
      );
    } else {
      setLocation(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const clearSearch = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    if (initialValue) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <form 
        onSubmit={handleSubmit}
        className={cn(
          "relative w-full overflow-hidden group transition-all-300",
          "rounded-2xl border border-border bg-white/80 backdrop-blur-sm",
          isFocused ? "shadow-lg" : "shadow-sm hover:shadow-md"
        )}
      >
        <div className="flex items-center px-4 h-14">
          <Search className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
          />
          
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="p-1 rounded-full hover:bg-secondary text-muted-foreground flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <button
            type="button"
            onClick={detectLocation}
            className={cn(
              "ml-2 p-2 rounded-full flex-shrink-0 transition-all-200",
              "text-muted-foreground hover:text-primary hover:bg-secondary"
            )}
            title="Use current location"
          >
            <MapPin className={cn(
              "h-5 w-5 transition-all",
              locationLoading && "animate-pulse"
            )} />
          </button>
        </div>
        
        {location && (
          <div className="px-4 py-2 bg-secondary/50 border-t border-border flex items-center text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
            {location}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
