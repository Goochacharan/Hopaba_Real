
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, MapPin } from 'lucide-react';

interface MarketplaceLocationSearchProps {
  onLocationSearch: (location: string) => void;
}

const MarketplaceLocationSearch: React.FC<MarketplaceLocationSearchProps> = ({ onLocationSearch }) => {
  const [searchLocation, setSearchLocation] = useState('');

  const handleLocationSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onLocationSearch(searchLocation);
  };

  return (
    <form onSubmit={handleLocationSearch} className="relative">
      <div className="relative">
        <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by postal code (560091) or area name (Nagarbhavi)"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          className="pl-8 pr-4"
        />
      </div>
    </form>
  );
};

export default MarketplaceLocationSearch;
