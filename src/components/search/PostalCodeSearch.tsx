
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

interface PostalCodeSearchProps {
  onSearch: (postalCode: string) => void;
}

const PostalCodeSearch: React.FC<PostalCodeSearchProps> = ({ onSearch }) => {
  const [postalCode, setPostalCode] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPostalCode(value);
    onSearch(value);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto mb-4">
      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search by postal code..."
        value={postalCode}
        onChange={handleChange}
        className="pl-9 pr-4"
        maxLength={6}
      />
    </div>
  );
};

export default PostalCodeSearch;
