
import React from 'react';
import { Sparkles, Award } from 'lucide-react';

interface LocationBadgesProps {
  showHiddenGemBadge: boolean;
  showMustVisitBadge: boolean;
}

const LocationBadges: React.FC<LocationBadgesProps> = ({
  showHiddenGemBadge,
  showMustVisitBadge
}) => {
  return (
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
  );
};

export default LocationBadges;
