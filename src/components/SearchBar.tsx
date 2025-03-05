
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const detectLocation = (e?: React.MouseEvent) => {
    e?.stopPropagation();
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

  const clearSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    // Focus the input when expanding
    if (!isExpanded) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Handle clicks outside the search bar to collapse it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node) && isExpanded) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  useEffect(() => {
    if (initialValue) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  return (
    <div className={cn("relative w-full max-w-2xl mx-auto", className)}>
      <form 
        ref={formRef}
        onSubmit={handleSubmit}
        onClick={!isExpanded ? toggleExpand : undefined}
        className={cn(
          "fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 transition-all duration-300 ease-in-out",
          isExpanded 
            ? "w-[90%] max-w-2xl rounded-2xl shadow-lg" 
            : "w-16 h-16 rounded-full shadow-md hover:shadow-lg cursor-pointer",
          "border border-border bg-white/90 backdrop-blur-sm"
        )}
      >
        {isExpanded ? (
          <>
            <div className="flex items-center px-4 h-16">
              <Search className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
              
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-lg py-4"
              />
              
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="p-2 rounded-full hover:bg-secondary text-muted-foreground flex-shrink-0"
                >
                  <X className="h-5 w-5" />
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
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Search className="h-6 w-6 text-primary" />
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
