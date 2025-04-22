import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import CommunityContributors from './location/CommunityContributors';

interface Location {
  id: string;
  name: string;
  category: string;
  address: string;
  average_rating: number;
  total_ratings: number;
  is_verified: boolean;
  image_url: string;
  description: string;
}

interface LocationCardProps {
  location: Location;
}

const LocationCard: React.FC<LocationCardProps> = ({ location }) => {
  const navigate = useNavigate();
  
  // Add query to fetch community notes data
  const { data: communityData } = useQuery({
    queryKey: ['communityNotes', location.id],
    queryFn: async () => {
      const { data: notes, error } = await supabase
        .from('community_notes')
        .select('user_id, user_display_name, user_avatar_url')
        .eq('location_id', location.id);
      
      if (error) throw error;
      return {
        contributors: notes || [],
        count: notes?.length || 0
      };
    }
  });

  return (
    <Card className="group relative overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={location.image_url}
          alt={location.name}
          className="aspect-video w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute top-2 left-2">
          <Badge>{location.category}</Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <CardTitle className="text-lg font-semibold line-clamp-1 flex items-center gap-1">
              {location.name}
              {location.is_verified && (
                <Badge variant="secondary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-3 h-3 mr-0.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground line-clamp-2">
              {location.address}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span>{location.average_rating.toFixed(1)}</span>
              <span className="text-xs">({location.total_ratings})</span>
            </div>
            {communityData && communityData.count > 0 && (
              <CommunityContributors
                contributors={communityData.contributors}
                count={communityData.count}
                onClick={() => navigate(`/location/${location.id}`, { state: { scrollTo: 'community-notes' } })}
              />
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {location.description}
        </p>
      </CardContent>
    </Card>
  );
};

export default LocationCard;
