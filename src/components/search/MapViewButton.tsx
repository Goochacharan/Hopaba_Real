
import React from 'react';
import { Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const MapViewButton: React.FC = () => {
  const navigate = useNavigate();

  const handleMapViewClick = () => {
    navigate('/map');
  };

  return (
    <Button
      onClick={handleMapViewClick}
      className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50 bg-primary hover:bg-primary/90"
      size="icon"
      aria-label="View on map"
    >
      <MapIcon className="h-6 w-6" />
    </Button>
  );
};

export default MapViewButton;
