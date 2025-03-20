import React from 'react';
import { MapPin, Calendar, BadgeCheck, Film } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
interface ListingMetadataProps {
  location: string;
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
      window.open(sellerInstagram);
      toast({
        title: "Opening video content",
        description: `Visiting ${sellerName}'s video content`,
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

  // When used in listing cards, return null for backward compatibility
  if (showInCard) {
    return null;
  }
  return <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <MapPin className="h-4 w-4" />
        <span>{location}</span>
      </div>
      <div className="flex items-center gap-1">
        <Calendar className="h-4 w-4" />
        <span>Listed on {format(new Date(createdAt), 'PPP')}</span>
        {sellerInstagram && <button onClick={handleInstagramClick} title="Watch video content" className="bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 p-1.5 rounded-md hover:shadow-md transition-all ml-2 font-thin text-justify px-[19px] py-[17px] my-[8px] mx-[13px]">
            <Film className="h-7 w-7 text-white" />
          </button>}
      </div>
      <div className="flex items-center gap-1 py-0 my-0 mx-0">
        <Badge variant="outline" className="flex items-center gap-1 text-amber-600 bg-amber-50">
          <BadgeCheck className="h-3 w-3" />
          <span>{condition}</span>
        </Badge>
      </div>
    </div>;
};
export default ListingMetadata;