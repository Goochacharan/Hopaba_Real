
import React from 'react';
import { MapPin, Calendar, Film, Instagram } from 'lucide-react';
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
  const {
    toast
  } = useToast();
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
  return <div className="flex flex-wrap items-center gap-x-2 gap-y-0 text-sm text-muted-foreground py-0 mt-[-2px]">
      {location && <div className="flex items-center gap-1 py-[3px]">
          <MapPin className="h-3 w-3" />
          <span>{location}</span>
        </div>}
      <div className="flex items-center gap-1 my-0 py-0 px-0">
        <Calendar className="h-3 w-3" />
        <span>Listed on {format(new Date(createdAt), 'PPP')}</span>
        {sellerInstagram && <button onClick={handleInstagramClick} title="Watch video content" className="flex items-center gap-1.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all ml-2 py-1.5 px-3">
            <Instagram className="h-3.5 w-3.5 text-white" />
            <span className="text-xs font-medium">Video</span>
          </button>}
      </div>
      {/* Condition badge has been moved to the image */}
    </div>;
};
export default ListingMetadata;
