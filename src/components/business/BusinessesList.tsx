
import React, { useState } from 'react';
import BusinessCard from './BusinessCard';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MapView from './MapView';

interface BusinessesListProps {
  businesses?: any[];
  loading?: boolean;
  error?: string | null;
}

const BusinessesList: React.FC<BusinessesListProps> = ({ businesses = [], loading = false, error = null }) => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Mock functions for onEdit and onDelete if needed
  const handleEdit = (business: any) => {
    console.log('Edit business:', business);
    // Implement edit functionality
  };

  const handleDelete = (id: string) => {
    console.log('Delete business:', id);
    // Implement delete functionality
  };

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
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
            className="rounded-r-none"
          >
            List View
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            onClick={() => setViewMode('map')}
            className="rounded-l-none"
          >
            Map View
          </Button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 gap-6">
          {businesses.map((business, index) => (
            <div key={business.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <BusinessCard 
                business={business} 
                className="h-full"
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      ) : (
        <MapView businesses={businesses} />
      )}
    </div>
  );
};

export default BusinessesList;
