
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import { Input } from './ui/input';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <form 
        ref={formRef}
        onSubmit={handleSubmit}
        className="w-full bg-white rounded-xl shadow-md border border-border"
      >
        <div className="flex items-center px-4 h-12">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground py-2"
          />
          
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="p-2 rounded-full hover:bg-secondary text-muted-foreground flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <button
            type="submit"
            className={cn(
              "ml-2 p-2 rounded-full flex-shrink-0 transition-all-200",
              "text-muted-foreground hover:text-primary hover:bg-secondary"
            )}
            title="Search"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
