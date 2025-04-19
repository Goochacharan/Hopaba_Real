
import React, { useState, useEffect, useRef } from 'react';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface AreaSearchBarProps {
  onAreaSelect: (area: string) => void;
  selectedArea: string;
}

const AreaSearchBar: React.FC<AreaSearchBarProps> = ({
  onAreaSelect,
  selectedArea
}) => {
  const [open, setOpen] = useState(false);
  const [areas, setAreas] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchAreas = async () => {
      const {
        data: serviceProviders,
        error
      } = await supabase.from('service_providers').select('area, city').not('area', 'is', null).not('city', 'is', null);

      if (error) {
        console.error('Error fetching areas:', error);
        return;
      }

      const uniqueAreas = new Set<string>();
      serviceProviders?.forEach(provider => {
        uniqueAreas.add(`${provider.area}, ${provider.city}`);
      });

      setAreas(Array.from(uniqueAreas).sort());
    };

    fetchAreas();
  }, []);

  useEffect(() => {
    if (searchValue) {
      const filtered = areas.filter(area => area.toLowerCase().includes(searchValue.toLowerCase()));
      setSuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
    } else {
      setSuggestions([]);
    }
  }, [searchValue, areas]);

  const handleSelect = (value: string) => {
    onAreaSelect(value);
    setSearchValue(value);
    setOpen(false);
  };

  const clearSearch = () => {
    setSearchValue('');
    inputRef.current?.focus();
  };

  const handleInputClick = () => {
    setOpen(true);
    // Ensure the input gets focus
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="w-full bg-white rounded-xl border border-border p-3 mb-4 py-0 px-0">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <input 
              ref={inputRef} 
              value={searchValue} 
              onChange={e => setSearchValue(e.target.value)} 
              placeholder="Search by area or city..." 
              className="w-full p-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary cursor-text" 
              onFocus={() => setOpen(true)}
              onClick={handleInputClick}
            />
            {searchValue && (
              <X 
                className="absolute right-10 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer" 
                onClick={clearSearch} 
              />
            )}
            <Search 
              className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer" 
              onClick={handleInputClick} 
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          {suggestions.length > 0 && <Command>
              <CommandList>
                <CommandEmpty>No area found.</CommandEmpty>
                <CommandGroup>
                  {suggestions.map(area => <CommandItem key={area} value={area} onSelect={() => handleSelect(area)}>
                      <Check className={cn("mr-2 h-4 w-4", selectedArea === area ? "opacity-100" : "opacity-0")} />
                      {area}
                    </CommandItem>)}
                </CommandGroup>
              </CommandList>
            </Command>}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AreaSearchBar;
