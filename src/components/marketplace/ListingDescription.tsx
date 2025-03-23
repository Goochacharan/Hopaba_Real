
import React from 'react';
import { format } from 'date-fns';
import { Instagram, Film } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ListingDescriptionProps {
  description: string;
  category: string;
  condition: string;
  location: string;
  createdAt: string;
  sellerInstagram?: string | null;
  showMetadata?: boolean;
}

const ListingDescription: React.FC<ListingDescriptionProps> = ({
  description,
  category,
  condition,
  location,
  createdAt,
  sellerInstagram,
  showMetadata = false
}) => {
  const openInstagramLink = () => {
    if (sellerInstagram) {
      window.open(sellerInstagram, '_blank');
    }
  };

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
              
              {sellerInstagram && (
                <>
                  <div className="text-sm font-medium flex items-center gap-1.5">
                    <Instagram className="h-3.5 w-3.5" />
                    <span>Instagram / Video</span>
                  </div>
                  <div className="text-sm">
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-secondary/50 transition-colors flex items-center gap-1"
                      onClick={openInstagramLink}
                    >
                      <span className="truncate">{sellerInstagram}</span>
                      <Film className="h-3.5 w-3.5 text-purple-500" />
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingDescription;
