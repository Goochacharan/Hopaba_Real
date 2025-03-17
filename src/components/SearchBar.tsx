
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, X, Mic } from 'lucide-react';
import { Input } from './ui/input';
import { toast } from '@/components/ui/use-toast';

interface SearchBarProps {
  onSearch: (query: string) => void;
  className?: string;
  placeholder?: string;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  className, 
  placeholder = "Try 'plumbers near me' or 'good restaurants in Indiranagar'", 
  initialValue = '' 
}) => {
  const [query, setQuery] = useState(initialValue);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const suggestionExamples = [
    "hidden gem restaurants in Indiranagar",
    "good flute teacher in Malleshwaram",
    "places to visit in Nagarbhavi",
    "best unisex salon near me",
    "plumbers available right now"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      console.log("Search bar submit with query:", query);
      onSearch(query);
      
      // Show suggestions after search only if query is very short
      if (query.trim().length < 8) {
        const randomSuggestion = suggestionExamples[Math.floor(Math.random() * suggestionExamples.length)];
        toast({
          title: "Try natural language",
          description: `Try being more specific like "${randomSuggestion}"`,
          duration: 5000,
        });
      }
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
        duration: 3000,
      });
      return;
    }
    
    setIsListening(true);
    
    // Use the appropriate constructor based on browser support
    const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionConstructor();
    
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
      
      // Auto-submit after voice input
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
        duration: 3000,
      });
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
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

  // This function will explicitly handle the search button click
  const handleSearchButtonClick = () => {
    if (query.trim()) {
      console.log("Search button clicked with query:", query);
      onSearch(query);
    }
  };

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
            onFocus={() => setIsExpanded(true)}
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
            type="button"
            onClick={startSpeechRecognition}
            className={cn(
              "p-2 rounded-full flex-shrink-0 transition-all duration-200",
              isListening 
                ? "text-primary bg-secondary animate-pulse" 
                : "text-muted-foreground hover:text-primary hover:bg-secondary"
            )}
            title="Voice search"
          >
            <Mic className="h-4 w-4" />
          </button>
          
          <button
            type="submit" 
            className={cn(
              "ml-2 p-2 rounded-full flex-shrink-0 transition-all duration-200",
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
