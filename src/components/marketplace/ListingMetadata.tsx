
import React from 'react';
import { MapPin, Calendar, BadgeCheck, Film } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ListingMetadataProps {
  location: string | null;
  createdAt: string;
  condition: string;
  sellerInstagram?: string | null;
  sellerName?: string;
  showInCard?: boolean;
  isCompact?: boolean;
}

const ListingMetadata: React.FC<ListingMetadataProps> = ({
  location,
  createdAt,
  condition,
  sellerInstagram,
  sellerName,
  showInCard = false,
  isCompact = false
}) => {
  const { toast } = useToast();
  
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
  
  return (
    <div className={cn(
      "flex flex-wrap items-center text-sm text-muted-foreground py-0",
      isCompact ? "gap-x-2 gap-y-1" : "gap-x-4 gap-y-2"
    )}>
      {location && (
        <div className="flex items-center gap-1">
          <MapPin className={cn(isCompact ? "h-3 w-3" : "h-4 w-4")} />
          <span>{location}</span>
        </div>
      )}
      <div className="flex items-center gap-1 my-0 py-0 px-0">
        <Calendar className={cn(isCompact ? "h-3 w-3" : "h-4 w-4")} />
        <span>
          {isCompact 
            ? format(new Date(createdAt), 'MMM d') 
            : `Listed on ${format(new Date(createdAt), 'PPP')}`}
        </span>
        {sellerInstagram && (
          <button 
            onClick={handleInstagramClick} 
            title="Watch video content" 
            className={cn(
              "bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 rounded-full hover:shadow-md transition-all",
              isCompact ? "ml-1 py-1 px-[20px] mx-[16px]" : "ml-2 py-2 px-[31px] mx-[26px]"
            )}
          >
            <Film className={cn(
              "text-white",
              isCompact ? "h-4 w-4" : "h-5 w-5"
            )} />
          </button>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Badge variant="outline" className="flex items-center gap-1 text-amber-600 bg-amber-50">
          <BadgeCheck className={cn(isCompact ? "h-2.5 w-2.5" : "h-3 w-3")} />
          <span>{condition}</span>
        </Badge>
      </div>
    </div>
  );
};

export default ListingMetadata;
