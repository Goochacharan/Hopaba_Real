
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, BadgeCheck } from 'lucide-react';

interface ListingDescriptionProps {
  description: string;
  category: string;
  condition: string;
  location: string;
  createdAt: string;
  showMetadata?: boolean;
}

const ListingDescription: React.FC<ListingDescriptionProps> = ({
  description,
  category,
  condition,
  location,
  createdAt,
  showMetadata = true,
}) => {
  const [expanded, setExpanded] = useState(false);
  const SHORT_DESC_LENGTH = 300;
  const needsToggle = description.length > SHORT_DESC_LENGTH;
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const displayedDescription = expanded ? description : description.slice(0, SHORT_DESC_LENGTH);
  
  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <h2 className="text-lg font-medium mb-4">Description</h2>
      
      <div className="mb-6">
        <p className="whitespace-pre-line text-muted-foreground">
          {displayedDescription}
          {!expanded && needsToggle && '...'}
        </p>
        
        {needsToggle && (
          <Button 
            variant="link" 
            onClick={toggleExpand} 
            className="mt-2 p-0 h-auto text-[#1EAEDB]"
          >
            {expanded ? 'Show less' : 'Read more'}
          </Button>
        )}
      </div>
      
      {showMetadata && (
        <div className="pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-2 items-center text-sm text-muted-foreground">
              <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50">
                {category}
              </Badge>
            </div>
            
            <div className="flex gap-2 items-center text-sm text-muted-foreground">
              <BadgeCheck className="h-4 w-4 text-amber-500" />
              <span>Condition: {condition}</span>
            </div>
            
            <div className="flex gap-2 items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
            
            <div className="flex gap-2 items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Listed on {format(new Date(createdAt), 'PPP')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDescription;
