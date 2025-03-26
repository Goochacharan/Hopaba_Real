
import React from 'react';
import { MapPin, Navigation2, IndianRupee } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LocationMetaProps {
  address: string;
  distance?: string;
  showDistanceUnderAddress?: boolean;
  priceRange?: string;
  tags?: string[];
  formatDistance: (distance?: string) => string;
}

const LocationMeta: React.FC<LocationMetaProps> = ({ 
  address, 
  distance,
  showDistanceUnderAddress = false,
  priceRange,
  tags = [],
  formatDistance
}) => {
  return (
    <>
      {/* Address and distance */}
      <div className="flex flex-col mb-3">
        <div className="flex items-center text-muted-foreground text-sm">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="truncate">{address}</span>
        </div>
        
        {distance && showDistanceUnderAddress && (
          <div className="text-muted-foreground text-sm pl-5 mt-1 flex items-center my-[3px] px-0">
            <Navigation2 className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
            {formatDistance(distance)}
          </div>
        )}
      </div>

      {/* Price and tags */}
      <div className="flex gap-2 mt-4 flex-wrap">
        {priceRange && (
          <Badge className="flex items-center gap-1 px-3 py-1.5 bg-[#1EAEDB]">
            <IndianRupee className="h-3.5 w-3.5" />
            {priceRange}
          </Badge>
        )}
        {tags.map((tag, index) => (
          <Badge key={index} className="bg-[#1EAEDB] text-white text-xs px-2 py-1 rounded-full">
            {tag}
          </Badge>
        ))}
      </div>
    </>
  );
};

export default LocationMeta;
