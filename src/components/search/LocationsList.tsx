
import React from 'react';
import { Link } from 'react-router-dom';
import { Recommendation } from '@/lib/mockData';
import { Loader2, MapPin, Star, Clock, ExternalLink, Phone, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/contexts/WishlistContext';

interface LocationsListProps {
  recommendations: Recommendation[];
  loading?: boolean;
  error?: string | null;
}

const LocationsList: React.FC<LocationsListProps> = ({ 
  recommendations,
  loading = false,
  error = null
}) => {
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-medium mb-2">No service providers found</h3>
        <p className="text-muted-foreground">
          There are currently no service providers matching your criteria.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 pb-24">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recommendations.map((recommendation, index) => (
          <Link 
            key={recommendation.id}
            to={`/location/${recommendation.id}`}
            className="animate-fade-in h-full" 
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Card className={cn(
              "h-full overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all hover:scale-[1.01]",
              "search-result-card", // This class will be used to identify search result cards
            )}>
              <div className="relative w-full h-48 overflow-hidden bg-muted">
                <img 
                  src={recommendation.image || '/placeholder.svg'} 
                  alt={recommendation.name}
                  className="w-full h-full object-cover"
                />
                {recommendation.isHiddenGem && (
                  <Badge variant="secondary" className="absolute top-2 left-2 bg-primary text-white">
                    Hidden Gem
                  </Badge>
                )}
                {recommendation.isMustVisit && (
                  <Badge variant="secondary" className="absolute top-2 right-2 bg-orange-500 text-white">
                    Must Visit
                  </Badge>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <div className="flex items-center gap-1 text-white">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{recommendation.rating}</span>
                    <span className="text-xs opacity-80">({recommendation.reviewCount || 0} reviews)</span>
                  </div>
                </div>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{recommendation.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> 
                  {recommendation.address}, {recommendation.city}
                  {recommendation.distance && (
                    <span className="ml-1 text-xs px-1.5 py-0.5 bg-muted rounded-full">
                      {recommendation.distance}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent className="py-0">
                <ScrollArea className="h-28 pr-3">
                  <p className="text-sm text-muted-foreground">
                    {recommendation.description}
                  </p>
                </ScrollArea>
                
                <div className="mt-4 space-y-2">
                  {recommendation.tags && recommendation.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center text-xs">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      {recommendation.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-accent">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {recommendation.hours && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{recommendation.hours}</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="pt-2 justify-between">
                <div className="flex gap-2">
                  {recommendation.phone && (
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                  )}
                  {recommendation.website && (
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Website
                    </Button>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWishlist({...recommendation, type: 'location'});
                  }}
                >
                  {isInWishlist(recommendation.id, 'location') ? 'Saved' : 'Save'}
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LocationsList;
