
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface PostalCodeSearchProps {
  onSearch: (postalCode: string) => void;
}

const PostalCodeSearch = ({ onSearch }: PostalCodeSearchProps) => {
  const [postalCode, setPostalCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(postalCode.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-3 mb-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Search by postal code..."
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default PostalCodeSearch;
