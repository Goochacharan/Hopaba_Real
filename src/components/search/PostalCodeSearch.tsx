
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PostalCodeSearchProps {
  onSearch: (postalCode: string) => void;
}

const PostalCodeSearch = ({ onSearch }: PostalCodeSearchProps) => {
  const [postalCode, setPostalCode] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPostalCode = postalCode.trim();
    
    if (!trimmedPostalCode) {
      toast({
        title: "Please enter a postal code",
        description: "Enter a 6-digit postal code to search for listings",
        variant: "destructive",
      });
      return;
    }

    // Check if postal code is 6 digits
    const isValidPostalCode = /^\d{6}$/.test(trimmedPostalCode);
    
    if (!isValidPostalCode) {
      toast({
        title: "Invalid postal code",
        description: "Postal code must be 6 digits",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Searching for listings with postal code:", trimmedPostalCode);
    onSearch(trimmedPostalCode);
  };

  const clearPostalCode = () => {
    setPostalCode('');
    onSearch(''); // Trigger search with empty string to clear filter
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-3 mb-4 animate-fade-in">
      <div className="flex items-center gap-2 relative">
        <Input
          type="text"
          placeholder="Search by postal code..."
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          className="flex-1 pr-10" // Add padding for clear icon
        />
        {postalCode && (
          <button
            type="button"
            onClick={clearPostalCode}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <Button type="submit" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default PostalCodeSearch;
