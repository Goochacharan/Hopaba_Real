
import React from 'react';
import ProfileMap from './ProfileMap';
import { useAuth } from '@/hooks/useAuth';

const LocationMapTab = () => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <p>You need to be logged in to view your locations.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Location Map</h2>
      <p className="text-muted-foreground">
        View all your businesses and listings on the map.
      </p>
      
      <ProfileMap />
    </div>
  );
};

export default LocationMapTab;
