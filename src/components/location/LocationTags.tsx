
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { IndianRupee } from 'lucide-react';

interface LocationTagsProps {
  price: string;
  tags?: string[];
}

const LocationTags: React.FC<LocationTagsProps> = ({ price, tags }) => {
  return (
    <div className="flex gap-2 mt-4 flex-wrap">
      {price && (
        <Badge className="flex items-center gap-1 bg-[#c63e7b] px-[7px] py-[4px]">
          <IndianRupee className="h-3.5 w-3.5" />
          {price}
        </Badge>
      )}
      
      {tags && tags.map((tag, index) => (
        <Badge key={index} className="bg-[#1EAEDB] text-white text-xs px-2 py-1 rounded-full">
          {tag}
        </Badge>
      ))}
    </div>
  );
};

export default LocationTags;
