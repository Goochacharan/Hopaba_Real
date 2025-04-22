
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

export interface Contributor {
  id: string;
  user_id: string;
  avatar_url?: string;
  user_display_name?: string;
}

interface CommunityContributorsProps {
  contributors: Contributor[];
  total: number;
  maxDisplayed?: number;
  onClick?: (e: React.MouseEvent) => void;
}

const CommunityContributors: React.FC<CommunityContributorsProps> = ({
  contributors,
  total,
  maxDisplayed = 8,
  onClick
}) => {
  const displayedContributors = contributors.slice(0, maxDisplayed);

  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-1 hover:opacity-90 transition-opacity"
    >
      <div className="flex -space-x-3">
        {displayedContributors.map((contributor, index) => (
          <Avatar 
            key={contributor.id} 
            className="w-6 h-6 border-2 border-white rounded-full bg-muted"
          >
            {contributor.avatar_url ? (
              <AvatarImage src={contributor.avatar_url} alt={contributor.user_display_name || 'Contributor'} />
            ) : (
              <AvatarFallback>
                <User className="h-3 w-3" />
              </AvatarFallback>
            )}
          </Avatar>
        ))}
      </div>
      <span className="text-sm text-muted-foreground">({total})</span>
    </button>
  );
};

export default CommunityContributors;
