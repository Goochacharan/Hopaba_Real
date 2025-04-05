
import React from 'react';
import { MapPin, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ListingMetadataProps {
  location: string;
  createdAt: string;
  condition: string;
  sellerInstagram?: string | null;
  sellerName: string;
  highlightText?: (text: string) => React.ReactNode;
}

const ListingMetadata: React.FC<ListingMetadataProps> = ({
  location,
  createdAt,
  condition,
  sellerInstagram,
  sellerName,
  highlightText
}) => {
  const formattedDate = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  }, [createdAt]);

  return (
    <div className="flex flex-wrap items-center text-sm text-gray-500 gap-2 mt-1">
      <div className="flex items-center">
        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
        <span className="truncate max-w-[200px]">
          {highlightText ? highlightText(location) : location}
        </span>
      </div>
      <div className="flex items-center">
        <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
        <span>{formattedDate}</span>
      </div>
      <div className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
        {condition}
      </div>
    </div>
  );
};

export default ListingMetadata;
