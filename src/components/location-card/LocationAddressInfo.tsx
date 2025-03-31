
import React from 'react';
import { MapPin, Navigation2, Film } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationAddressInfoProps {
  address: string;
  distance?: string;
  instagram?: string;
  showDistanceUnderAddress?: boolean;
}

const LocationAddressInfo: React.FC<LocationAddressInfoProps> = ({
  address,
  distance,
  instagram,
  showDistanceUnderAddress = false
}) => {
  const { toast } = useToast();

  const formatDistance = (distanceText: string | undefined) => {
    if (!distanceText) return '';
    const distanceMatch = distanceText.match(/(\d+(\.\d+)?)/);
    if (distanceMatch) {
      const distanceValue = parseFloat(distanceMatch[0]);
      return `${distanceValue.toFixed(1)} km away`;
    }
    let formattedDistance = distanceText.replace('miles', 'km');
    formattedDistance = formattedDistance.replace('away away', 'away');
    return formattedDistance;
  };

  const hasInstagram = () => {
    return instagram && typeof instagram === 'string' && instagram.trim() !== '';
  };

  const handleInstagram = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!instagram || instagram.trim() === '') {
      toast({
        title: "No Instagram",
        description: `Hasn't provided an Instagram profile`,
        duration: 2000
      });
      return;
    }
    window.open(instagram, '_blank');
    toast({
      title: "Opening Instagram",
      description: `Opening Instagram...`,
      duration: 2000
    });
  };

  return (
    <div className="flex flex-col mb-3">
      <div className="flex items-center justify-between text-muted-foreground text-sm">
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="truncate">{address}</span>
        </div>
        {hasInstagram() && (
          <button 
            onClick={handleInstagram} 
            title="Watch video content" 
            className="bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 rounded-full hover:shadow-md transition-all ml-2 p-1.5 px-[29px] mx-[55px] py-[7px]"
          >
            <Film className="h-4 w-4 text-white" />
          </button>
        )}
      </div>
      
      {distance && showDistanceUnderAddress && (
        <div className="text-muted-foreground text-sm pl-5 mt-1 flex items-center justify-between my-[3px] px-0">
          <div className="flex items-center">
            <Navigation2 className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
            {formatDistance(distance)}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationAddressInfo;
