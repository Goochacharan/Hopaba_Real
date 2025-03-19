import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, X, Mic, Sparkles } from 'lucide-react';
import { Input } from './ui/input';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';
import SearchSuggestions, { Suggestion } from './SearchSuggestions';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchBarProps {
  onSearch: (query: string) => void;
  className?: string;
  placeholder?: string;
  initialValue?: string;
  currentRoute?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  className,
  placeholder,
  initialValue = '',
  currentRoute
}) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [query, setQuery] = useState(initialValue);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const debouncedQuery = useDebounce(query, 300);
  
  const getPlaceholder = () => {
    if (currentRoute === '/my-list' || currentPath === '/my-list') {
      return "Search from your list...";
    }
    return placeholder || "What are you looking for today?";
  };
  
  const suggestionExamples = ["hidden gem restaurants in Indiranagar", "good flute teacher in Malleshwaram", "places to visit in Nagarbhavi", "best unisex salon near me", "plumbers available right now"];
  
  const enhanceSearchQuery = async (rawQuery: string) => {
    if (!rawQuery.trim()) return rawQuery;
    
    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-search', {
        body: { query: rawQuery }
      });
      
      if (error) {
        console.error('Error enhancing search:', error);
        return rawQuery;
      }
      
      console.log('AI enhanced search:', data);
      
      if (data.enhanced && data.enhanced !== rawQuery) {
        toast({
          title: "Search enhanced with AI",
          description: `We improved your search to: "${data.enhanced}"`,
          duration: 5000
        });
        
        return data.enhanced;
      }
      
      return rawQuery;
    } catch (err) {
      console.error('Failed to enhance search:', err);
      return rawQuery;
    } finally {
      setIsEnhancing(false);
    }
  };
  
  const fetchSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setShowSuggestions(true);
      setIsLoadingSuggestions(true);
      try {
        const { data, error } = await supabase.functions.invoke('search-suggestions', {
          body: { query: '' }
        });
        
        if (error) {
          console.error('Error fetching default suggestions:', error);
          setSuggestions([]);
          return;
        }
        
        if (data?.suggestions) {
          setSuggestions(data.suggestions);
        }
      } catch (err) {
        console.error('Failed to fetch default suggestions:', err);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
      return;
    }
    
    setIsLoadingSuggestions(true);
    setShowSuggestions(true);
    
    try {
      console.log('Fetching suggestions for query:', searchQuery);
      const { data, error } = await supabase.functions.invoke('search-suggestions', {
        body: { query: searchQuery }
      });
      
      if (error) {
        console.error('Error fetching suggestions:', error);
        // Fallback suggestions
        setSuggestions([
          { suggestion: `${searchQuery} restaurants near me`, category: 'Restaurants', source: 'fallback' },
          { suggestion: `Best ${searchQuery} in Bangalore`, category: 'Places', source: 'fallback' },
          { suggestion: `${searchQuery} services`, category: 'Services', source: 'fallback' }
        ]);
      } else if (data?.suggestions) {
        console.log('Got suggestions:', data.suggestions);
        setSuggestions(data.suggestions);
      }
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
      // Fallback suggestions
      setSuggestions([
        { suggestion: `${searchQuery} restaurants near me`, category: 'Restaurants', source: 'fallback' },
        { suggestion: `Best ${searchQuery} in Bangalore`, category: 'Places', source: 'fallback' },
        { suggestion: `${searchQuery} services`, category: 'Services', source: 'fallback' }
      ]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      console.log("Original search query:", query);
      setShowSuggestions(false);
      
      const enhancedQuery = await enhanceSearchQuery(query);
      console.log("Enhanced search query:", enhancedQuery);
      
      onSearch(enhancedQuery);

      if (query.trim().length < 8) {
        const randomSuggestion = suggestionExamples[Math.floor(Math.random() * suggestionExamples.length)];
        toast({
          title: "Try natural language",
          description: `Try being more specific like "${randomSuggestion}"`,
          duration: 5000
        });
      }
      
      setQuery('');
    }
  };
  
  const clearSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Not supported",
        description: "Voice search is not supported in your browser",
        variant: "destructive",
        duration: 3000
      });
      return;
    }
    setIsListening(true);

    const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionConstructor();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);

      setTimeout(() => {
        onSearch(transcript);
      }, 500);
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: "Error",
        description: "Could not recognize speech",
        variant: "destructive",
        duration: 3000
      });
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.start();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node) && isExpanded) {
        setIsExpanded(false);
        setShowSuggestions(false);
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

  useEffect(() => {
    if (isExpanded) {
      fetchSuggestions(debouncedQuery);
    }
  }, [debouncedQuery, isExpanded]);

  const handleSearchButtonClick = async () => {
    if (query.trim()) {
      console.log("Search button clicked with query:", query);
      setShowSuggestions(false);
      
      const enhancedQuery = await enhanceSearchQuery(query);
      
      onSearch(enhancedQuery);
      
      setQuery('');
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
    
    setTimeout(() => {
      setQuery('');
    }, 100);
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <form ref={formRef} onSubmit={handleSubmit} className="w-full bg-white rounded-xl shadow-md border border-border/50 relative">
        <div className="flex items-center p-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder={getPlaceholder()}
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 pl-2"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setIsExpanded(true);
              setShowSuggestions(true);
              if (!query.trim()) {
                fetchSuggestions('');
              } else {
                fetchSuggestions(query);
              }
            }}
          />
          
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          
          <button
            type="button"
            onClick={startSpeechRecognition}
            className={cn(
              "p-2 transition-colors rounded-full",
              isListening 
                ? "text-red-500 animate-pulse" 
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Voice search"
          >
            <Mic className="h-5 w-5" />
          </button>
          
          <button 
            type="submit"
            className={cn(
              "p-2 text-primary hover:text-primary-foreground hover:bg-primary rounded-full transition-colors flex items-center",
              isEnhancing && "opacity-70"
            )}
            aria-label="Search"
            onClick={handleSearchButtonClick}
            disabled={isEnhancing}
          >
            {isEnhancing ? (
              <Sparkles className="h-5 w-5 animate-pulse" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>
        </div>
        
        <SearchSuggestions
          suggestions={suggestions}
          isLoading={isLoadingSuggestions}
          onSelect={handleSuggestionSelect}
          visible={showSuggestions && isExpanded}
          searchQuery={query}
        />
      </form>
    </div>
  );
};

export default SearchBar;
