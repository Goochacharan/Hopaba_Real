
import React from 'react';
import { MapPin, Calendar, BadgeCheck, Film, Instagram } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
      window.open(sellerInstagram, '_blank');
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
  
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground py-0">
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
      <div className="flex items-center gap-1">
        <Badge variant="outline" className="flex items-center gap-1 text-amber-600 bg-amber-50">
          <BadgeCheck className="h-3 w-3" />
          <span>{condition}</span>
        </Badge>
      </div>
      {sellerInstagram && (
        <Badge 
          variant="outline" 
          className="flex items-center gap-1 cursor-pointer hover:bg-purple-50 border-purple-200 text-purple-600 bg-purple-50"
          onClick={handleInstagramClick}
        >
          <Instagram className="h-3 w-3 text-purple-600" />
          <Film className="h-3 w-3 text-purple-600" />
          <span>Video</span>
        </Badge>
      )}
    </div>
  );
};

export default ListingMetadata;
