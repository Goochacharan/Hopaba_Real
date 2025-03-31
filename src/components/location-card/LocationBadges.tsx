
import React from 'react';
import { Sparkles, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { IndianRupee } from 'lucide-react';

interface LocationBadgesProps {
  showHiddenGemBadge: boolean;
  showMustVisitBadge: boolean;
  priceInfo?: string;
  tags?: string[];
}

export const LocationBadges: React.FC<LocationBadgesProps> = ({
  showHiddenGemBadge,
  showMustVisitBadge,
  priceInfo,
  tags
}) => {
  return (
    <>
      <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-2">
        {showHiddenGemBadge && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/90 backdrop-blur-sm text-white flex items-center">
            <Sparkles className="h-3 w-3 mr-1" />
            Hidden Gem
          </span>
        )}
        
        {showMustVisitBadge && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-500/90 backdrop-blur-sm text-white flex items-center">
            <Award className="h-3 w-3 mr-1" />
            Must Visit
          </span>
        )}
      </div>
      
      {(priceInfo || tags) && (
        <div className="flex gap-2 mt-4 flex-wrap">
          {priceInfo && (
            <Badge className="flex items-center gap-1 px-3 py-1.5 bg-[#c63e7b]">
              <IndianRupee className="h-3.5 w-3.5" />
              {priceInfo}
            </Badge>
          )}
          
          {tags && tags.map((tag, index) => (
            <Badge key={index} className="bg-[#1EAEDB] text-white text-xs px-2 py-1 rounded-full">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </>
  );
};

export default LocationBadges;
