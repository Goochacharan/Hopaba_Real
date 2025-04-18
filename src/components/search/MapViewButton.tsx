
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Map } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MapViewButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const handleMapViewClick = () => {
    // Preserve the current search parameters when navigating
    navigate({
      pathname: '/map',
      search: searchParams.toString()
    });
  };
  
  return (
    <div className="fixed bottom-20 right-6 z-30">
      <Button 
        onClick={handleMapViewClick} 
        size="lg" 
        className="rounded-full shadow-lg h-14 w-14 bg-primary hover:bg-primary/90"
      >
        <Map className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default MapViewButton;
