
import React from 'react';
import { format } from 'date-fns';

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
  showMetadata = false
}) => {
  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-3">Description</h2>
      <div className="space-y-4">
        <p className="text-muted-foreground whitespace-pre-line">{description}</p>
        
        {showMetadata && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-y-3">
              <div className="text-sm font-medium">Category</div>
              <div className="text-sm text-muted-foreground">{category}</div>
              
              <div className="text-sm font-medium">Condition</div>
              <div className="text-sm text-muted-foreground">{condition}</div>
              
              <div className="text-sm font-medium">Location</div>
              <div className="text-sm text-muted-foreground">{location}</div>
              
              <div className="text-sm font-medium">Listed on</div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(createdAt), 'PPP')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingDescription;
