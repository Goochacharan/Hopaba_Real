
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, X, Mic, Sparkles } from 'lucide-react';
import { Input } from './ui/input';
import { toast } from '@/components/ui/use-toast';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { useSearchEnhancement } from '@/hooks/useSearchEnhancement';
import SearchAuthDialog from './search/SearchAuthDialog';

interface SearchBarProps {
  onSearch: (query: string) => void;
  className?: string;
  placeholder?: string;
  initialValue?: string;
  currentRoute?: string;
}

const suggestionExamples = [
  "hidden gem restaurants in Indiranagar",
  "good flute teacher in Malleshwaram",
  "places to visit in Nagarbhavi",
  "best unisex salon near me",
  "plumbers available right now"
];

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  className,
  placeholder,
  initialValue = '',
  currentRoute
}) => {
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;
  
  const [query, setQuery] = useState(initialValue);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Get correct variables and methods from the hook
  const { enhancing, enhanceQuery } = useSearchEnhancement();
  const { isListening, startSpeechRecognition } = useVoiceSearch({
    onTranscript: (transcript) => {
      setQuery(transcript);
      setTimeout(() => {
        onSearch(transcript);
      }, 500);
    }
  });

  const getPlaceholder = () => {
    if (currentPath === '/events' || currentPath.startsWith('/events')) {
      return "Search for events...";
    }
    if (currentPath === '/marketplace' || currentPath.startsWith('/marketplace')) {
      return "Search for cars, bikes, mobiles...";
    }
    if (currentRoute === '/my-list' || currentPath === '/my-list') {
      return "Search from your list...";
    }
    return placeholder || "What are you looking for today?";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    if (query.trim()) {
      console.log("Original search query:", query);
      let enhancedQuery = query;
      
      if (currentPath !== '/events' && currentPath !== '/marketplace' && !currentPath.startsWith('/marketplace')) {
        console.log("Not a marketplace or events page, enhancing query");
        enhancedQuery = await enhanceQuery(query, currentPath !== '/');
      }
      
      console.log("Final search query to use:", enhancedQuery);
      if (enhancedQuery !== query) {
        setQuery(enhancedQuery);
      }
      onSearch(enhancedQuery);
      
      if (query.trim().length < 8 && currentPath !== '/events' && currentPath !== '/marketplace' && !currentPath.startsWith('/marketplace')) {
        const randomSuggestion = suggestionExamples[Math.floor(Math.random() * suggestionExamples.length)];
        toast({
          title: "Try natural language",
          description: `Try being more specific like "${randomSuggestion}"`,
          duration: 5000
        });
      }
    }
  };

  const clearSearch = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSearchButtonClick = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    
    if (query.trim()) {
      let enhancedQuery = query;
      
      if (currentPath !== '/events' && currentPath !== '/marketplace' && !currentPath.startsWith('/marketplace')) {
        enhancedQuery = await enhanceQuery(query, currentPath !== '/');
      }
      
      if (enhancedQuery !== query) {
        setQuery(enhancedQuery);
      }
      onSearch(enhancedQuery);
    }
  };

  const handleVoiceSearch = () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    startSpeechRecognition();
  };

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
      <form ref={formRef} onSubmit={handleSubmit} className="w-full bg-white rounded-xl shadow-md border border-border/50">
        <div className="flex items-center p-2 px-[6px] py-[10px]">
          <Input 
            ref={inputRef} 
            type="text" 
            placeholder={getPlaceholder()} 
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 pl-2" 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            onFocus={() => setIsExpanded(true)}
            onClick={() => setIsExpanded(true)}
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
            onClick={handleVoiceSearch} 
            className={cn(
              "p-2 transition-colors rounded-full", 
              isListening ? "text-red-500 animate-pulse" : "text-muted-foreground hover:text-foreground"
            )} 
            aria-label="Voice search"
          >
            <Mic className="h-5 w-5" />
          </button>
          
          <button 
            type="submit" 
            className={cn(
              "p-2 text-primary hover:text-primary-foreground hover:bg-primary rounded-full transition-colors flex items-center", 
              enhancing && "opacity-70"
            )} 
            aria-label="Search" 
            onClick={handleSearchButtonClick} 
            disabled={enhancing}
          >
            {enhancing ? <Sparkles className="h-5 w-5 animate-pulse" /> : <Search className="h-5 w-5" />}
          </button>
        </div>
      </form>

      <SearchAuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
      />
    </div>
  );
};

export default SearchBar;
