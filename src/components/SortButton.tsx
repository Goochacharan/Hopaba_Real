
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown } from 'lucide-react';

export type SortOption = 'rating' | 'distance' | 'reviewCount' | 'newest';

interface SortButtonProps {
  onSortChange: (option: SortOption) => void;
  currentSort: SortOption;
}

const SortButton: React.FC<SortButtonProps> = ({ onSortChange, currentSort }) => {
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'rating', label: 'Rating (High to Low)' },
    { value: 'distance', label: 'Distance (Near to Far)' },
    { value: 'reviewCount', label: 'Review Count' },
    { value: 'newest', label: 'Newest First' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full border border-border/60 flex items-center justify-center bg-background w-10 h-10 relative shadow-[0_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_0px_0px_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[3px] transition-all"
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className={currentSort === option.value ? "bg-secondary font-medium" : ""}
            onClick={() => onSortChange(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortButton;
