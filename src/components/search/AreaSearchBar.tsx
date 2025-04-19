
import React, { useState, useEffect } from 'react';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Search, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface AreaSearchBarProps {
  onAreaSelect: (area: string) => void;
  selectedArea: string;
}

const AreaSearchBar: React.FC<AreaSearchBarProps> = ({ onAreaSelect, selectedArea }) => {
  const [open, setOpen] = useState(false);
  const [areas, setAreas] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const fetchAreas = async () => {
      const { data: serviceProviders, error } = await supabase
        .from('service_providers')
        .select('area, city')
        .not('area', 'is', null)
        .not('city', 'is', null);

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

  const filteredAreas = areas.filter(area =>
    area.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="w-full bg-white rounded-xl border border-border p-3 mb-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-muted-foreground"
          >
            {selectedArea || "Search by area..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              placeholder="Search areas..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>No area found.</CommandEmpty>
              <CommandGroup>
                {filteredAreas.map((area) => (
                  <CommandItem
                    key={area}
                    value={area}
                    onSelect={() => {
                      onAreaSelect(area);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedArea === area ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {area}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AreaSearchBar;
