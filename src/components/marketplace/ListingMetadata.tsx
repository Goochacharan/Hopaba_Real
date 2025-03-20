
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
  const { toast } = useToast();
  
  const handleInstagramClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sellerInstagram) {
      window.open(sellerInstagram.startsWith('http') ? sellerInstagram : `https://instagram.com/${sellerInstagram.replace('@', '')}`);
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

  // When used in listing cards, we need to show a compact version
  if (showInCard) {
    return (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{format(new Date(createdAt), 'PP')}</span>
        </div>
        {sellerInstagram && (
          <button 
            onClick={handleInstagramClick} 
            title="Watch video content" 
            className="rounded-full border-2 border-transparent bg-white p-0.5 shadow-sm hover:shadow-md transition-all"
            style={{ 
              backgroundImage: 'linear-gradient(#fff, #fff), linear-gradient(to right, #fa7e1e, #d62976, #962fbf)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'content-box, border-box' 
            }}
          >
            <Film className="h-3 w-3 text-[#962fbf]" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <MapPin className="h-4 w-4" />
        <span>{location}</span>
      </div>
      <div className="flex items-center gap-1">
        <Calendar className="h-4 w-4" />
        <span>Listed on {format(new Date(createdAt), 'PPP')}</span>
        {sellerInstagram && (
          <button 
            onClick={handleInstagramClick} 
            title="Watch video content" 
            className="rounded-full border-2 border-transparent bg-white p-1 shadow-sm hover:shadow-md transition-all ml-2"
            style={{ 
              backgroundImage: 'linear-gradient(#fff, #fff), linear-gradient(to right, #fa7e1e, #d62976, #962fbf)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'content-box, border-box' 
            }}
          >
            <Film className="h-5 w-5 text-[#962fbf]" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Badge variant="outline" className="flex items-center gap-1 text-amber-600 bg-amber-50">
          <BadgeCheck className="h-3 w-3" />
          <span>{condition}</span>
        </Badge>
      </div>
    </div>
  );
};

export default ListingMetadata;
