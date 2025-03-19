
import React from 'react';
import { Compass, Search, Tag, MessageCircle, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Suggestion {
  suggestion: string;
  category: string;
  source: string;
}

interface SearchSuggestionsProps {
  suggestions: Suggestion[];
  isLoading: boolean;
  onSelect: (suggestion: string) => void;
  visible: boolean;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  isLoading,
  onSelect,
  visible
}) => {
  if (!visible) return null;

  const getIcon = (source: string) => {
    switch (source) {
      case 'place':
        return <Search className="h-4 w-4 mr-2 text-muted-foreground" />;
      case 'category':
        return <Compass className="h-4 w-4 mr-2 text-muted-foreground" />;
      case 'tag':
        return <Tag className="h-4 w-4 mr-2 text-muted-foreground" />;
      case 'city':
        return <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />;
      case 'description':
        return <MessageCircle className="h-4 w-4 mr-2 text-muted-foreground" />;
      case 'event':
        return <Clock className="h-4 w-4 mr-2 text-muted-foreground" />;
      default:
        return <Search className="h-4 w-4 mr-2 text-muted-foreground" />;
    }
  };

  return (
    <div className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-border/50 z-50 overflow-hidden">
      {isLoading ? (
        <div className="p-3 text-sm text-muted-foreground">
          <div className="flex items-center">
            <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-primary rounded-full"></div>
            Loading suggestions...
          </div>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="p-3 text-sm text-muted-foreground">No suggestions found</div>
      ) : (
        <ul className="max-h-[300px] overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="px-3 py-2 hover:bg-primary/5 cursor-pointer transition-colors"
              onClick={() => onSelect(suggestion.suggestion)}
            >
              <div className="flex items-center">
                {getIcon(suggestion.source)}
                <span className="text-sm">{suggestion.suggestion}</span>
              </div>
              {suggestion.category && (
                <div className="ml-6 text-xs text-muted-foreground">
                  {suggestion.category}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchSuggestions;
