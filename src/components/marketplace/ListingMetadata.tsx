
import React from 'react';
import { MapPin, Calendar, Check } from 'lucide-react';

interface ListingMetadataProps {
  location: string;
  createdAt: string;
  condition: string;
}

const ListingMetadata: React.FC<ListingMetadataProps> = ({
  location,
  createdAt,
  condition
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  return (
    <>
      <div className="flex items-center text-muted-foreground mb-2 text-sm">
        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
        <span className="truncate">{location}</span>
      </div>
      
      <div className="flex items-center text-muted-foreground mb-2 text-sm">
        <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
        <span>Listed on {formatDate(createdAt)}</span>
      </div>
      
      <div className="flex items-center mb-3">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 flex items-center">
          <Check className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
          {condition}
        </span>
      </div>
    </>
  );
};

export default ListingMetadata;
