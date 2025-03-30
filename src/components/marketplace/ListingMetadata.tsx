
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
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground py-0">
      {location && (
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
      )}
      <div className="flex items-center gap-1 my-0 py-0 px-0">
        <Calendar className="h-4 w-4" />
        <span>Listed on {format(new Date(createdAt), 'PPP')}</span>
        {sellerInstagram && (
          <button 
            onClick={handleInstagramClick} 
            title="Watch video content" 
            className="bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 rounded-full hover:shadow-md transition-all ml-2 py-2 px-[31px] mx-[26px] shadow-[0_4px_0px_0px_rgba(0,0,0,0.25)] hover:shadow-[0_2px_0px_0px_rgba(0,0,0,0.25)] active:shadow-none active:translate-y-[3px]"
          >
            <Film className="h-5 w-5 text-white" />
          </button>
        )}
      </div>
      {/* Condition badge has been moved to the image */}
    </div>
  );
};

export default ListingMetadata;
