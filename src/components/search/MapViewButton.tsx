
import React from 'react';
import { Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const MapViewButton: React.FC = () => {
  const navigate = useNavigate();
  
  const handleViewMap = () => {
    navigate('/map');
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="flex items-center gap-1.5"
      onClick={handleViewMap}
    >
      <MapIcon className="h-4 w-4" />
      <span>Map View</span>
    </Button>
  );
};

export default MapViewButton;
