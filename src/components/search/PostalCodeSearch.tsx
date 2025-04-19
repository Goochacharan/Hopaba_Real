
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface PostalCodeSearchProps {
  onSearch: (postalCode: string, area: string) => void;
}

const PostalCodeSearch: React.FC<PostalCodeSearchProps> = ({ onSearch }) => {
  const [postalCode, setPostalCode] = useState('');
  const [area, setArea] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(postalCode.trim(), area.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-3 mb-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
        <Input
          placeholder="Enter postal code"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder="Enter area"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="sm">
          Search
        </Button>
      </div>
    </form>
  );
};

export default PostalCodeSearch;
