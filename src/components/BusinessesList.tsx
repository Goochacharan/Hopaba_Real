
import React from 'react';
import BusinessCard from './BusinessCard';
import MapViewButton from './search/MapViewButton';
import { Loader2 } from 'lucide-react';

interface BusinessesListProps {
  businesses?: any[];
  loading?: boolean;
  error?: string | null;
}

const BusinessesList: React.FC<BusinessesListProps> = ({ businesses = [], loading = false, error = null }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-medium mb-2">No businesses found</h3>
        <p className="text-muted-foreground">
          There are currently no businesses matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 gap-6">
        {businesses.map((business, index) => (
          <div key={business.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <BusinessCard business={business} className="h-full" />
          </div>
        ))}
      </div>
      
      {/* Add the MapViewButton if we have businesses to display */}
      {businesses.length > 0 && <MapViewButton />}
    </div>
  );
};

export default BusinessesList;
