
import React from 'react';
import { format } from 'date-fns';
import { Film } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ListingDescriptionProps {
  description: string;
  category: string;
  condition: string;
  location: string;
  createdAt: string;
  sellerInstagram?: string | null;
  sellerName?: string | null;
  showMetadata?: boolean;
}

const ListingDescription: React.FC<ListingDescriptionProps> = ({
  description,
  category,
  condition,
  location,
  createdAt,
  sellerInstagram,
  sellerName,
  showMetadata = false
}) => {
  const { toast } = useToast();
  
  const handleInstagramClick = () => {
    if (sellerInstagram) {
      window.open(sellerInstagram);
      toast({
        title: "Opening video content",
        description: `Visiting ${sellerName}'s video content`,
        duration: 2000
      });
    }
  };

  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-3">Description</h2>
      <div className="space-y-4">
        <p className="text-muted-foreground whitespace-pre-line">{description}</p>
        
        {sellerInstagram && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium">Video Content</h3>
              <button 
                onClick={handleInstagramClick}
                className="bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 rounded-full hover:shadow-md transition-all p-1.5"
                title="Watch video content"
              >
                <Film className="h-4 w-4 text-white" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              This listing has additional video content on Instagram
            </p>
          </div>
        )}
        
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
