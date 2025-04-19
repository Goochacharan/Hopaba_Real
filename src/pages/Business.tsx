
import React from 'react';
import BusinessesList from '@/components/business/BusinessesList';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Business: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Local Businesses</h1>
        <Link to="/add-business">
          <Button variant="default" className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Add Business
          </Button>
        </Link>
      </div>
      <BusinessesList />
    </div>
  );
};

export default Business;
