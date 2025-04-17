
import React from 'react';
import { Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MapFilterButtonProps {
  className?: string;
}

const MapFilterButton: React.FC<MapFilterButtonProps> = ({ className }) => {
  const navigate = useNavigate();

  const handleMapViewClick = () => {
    navigate('/map');
  };

  return (
    <Button 
      onClick={handleMapViewClick}
      variant="outline" 
      size="sm" 
      className={cn(
        "rounded-full border flex items-center justify-center w-10 h-10",
        className
      )}
      aria-label="View on map"
    >
      <Map className="w-4 h-4" />
    </Button>
  );
};

export default MapFilterButton;
