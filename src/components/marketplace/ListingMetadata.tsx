
import React from 'react';
import { MapPin, Calendar, BadgeCheck } from 'lucide-react';
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
  
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <MapPin className="h-4 w-4" />
        <span>{location}</span>
      </div>
      <div className="flex items-center gap-1">
        <Calendar className="h-4 w-4" />
        <span>Listed on {format(new Date(createdAt), 'PPP')}</span>
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
