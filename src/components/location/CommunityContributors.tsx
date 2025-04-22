
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface Contributor {
  user_display_name?: string;
  user_avatar_url?: string;
}

interface CommunityContributorsProps {
  contributors: Contributor[];
  count: number;
  maxDisplay?: number;
  className?: string;
  onClick?: () => void;
}

const CommunityContributors: React.FC<CommunityContributorsProps> = ({
  contributors,
  count,
  maxDisplay = 6,
  className,
  onClick
}) => {
  const displayedContributors = contributors.slice(0, maxDisplay);

  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 group hover:opacity-90 transition-opacity", 
        className
      )}
    >
      <div className="flex -space-x-3">
        {displayedContributors.map((contributor, index) => (
          <Avatar 
            key={index} 
            className="ring-2 ring-background w-6 h-6 hover:z-10 transition-transform"
          >
            {contributor.user_avatar_url ? (
              <AvatarImage src={contributor.user_avatar_url} alt={contributor.user_display_name || 'Contributor'} />
            ) : (
              <AvatarFallback>
                {(contributor.user_display_name?.[0] || 'A').toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        ))}
      </div>
      {count > 0 && (
        <span className="text-sm text-muted-foreground ml-1">
          ({count})
        </span>
      )}
    </button>
  );
};

export default CommunityContributors;
