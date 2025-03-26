
import React from 'react';
import { MapPin, Calendar, Film } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ListingMetadataProps {
  location: string | null;
  createdAt: string;
  condition: string;
  sellerInstagram?: string | null;
  sellerName?: string;
  showInCard?: boolean;
}

const ListingMetadata: React.FC<ListingMetadataProps> = ({
  location,
  createdAt,
  condition,
  sellerInstagram,
  sellerName,
  showInCard = false
}) => {
  const { toast } = useToast();
  
  const handleInstagramClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sellerInstagram) {
      console.log("Opening video content:", sellerInstagram);
      window.open(sellerInstagram, '_blank');
      toast({
        title: "Opening video content",
        description: `Visiting ${sellerName || 'seller'}'s video content`,
        duration: 2000
      });
    } else {
      toast({
        title: "Video content not available",
        description: "The seller has not provided any video links",
        variant: "destructive",
        duration: 2000
      });
    }
  };
  
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-muted-foreground py-0">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {location && (
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
        )}
        <div className="flex items-center gap-1 my-0 py-0 px-0">
          <Calendar className="h-4 w-4" />
          <span>Listed on {format(new Date(createdAt), 'PPP')}</span>
        </div>
      </div>
      
      {sellerInstagram && (
        <button 
          onClick={handleInstagramClick} 
          title="Watch video content" 
          className="bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 rounded-full hover:shadow-md transition-all py-2 px-[31px]"
        >
          <Film className="h-5 w-5 text-white" />
        </button>
      )}
    </div>
  );
};

export default ListingMetadata;
