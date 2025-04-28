
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ListingDetailsErrorProps {
  error: Error | null;
  onBack: () => void;
}

const ListingDetailsError: React.FC<ListingDetailsErrorProps> = ({ error, onBack }) => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Button 
        onClick={onBack}
        variant="ghost" 
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Marketplace</span>
      </Button>
      
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error instanceof Error ? error.message : "Failed to load listing details"}</AlertDescription>
      </Alert>
      
      <Button asChild>
        <Link to="/marketplace">Browse other listings</Link>
      </Button>
    </div>
  );
};

export default ListingDetailsError;
