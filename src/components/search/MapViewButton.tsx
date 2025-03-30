
import React from 'react';
import { Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const MapViewButton: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="fixed left-4 bottom-24 z-[61]">
      <Button 
        variant="default" 
        size="icon" 
        onClick={() => navigate('/map')}
        className="rounded-full shadow-lg hover:shadow-xl"
        aria-label="Map View"
      >
        <MapIcon className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default MapViewButton;
