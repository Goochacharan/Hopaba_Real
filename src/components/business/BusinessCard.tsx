
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BusinessCardProps {
  id: string;
  name: string;
  category: string;
  description?: string;
  address?: string;
  distance?: string;
  rating: number;
  image: string;
  tags?: string[];
  tagMatches?: string[]; // New prop for matching tags
  isTagMatch?: boolean;  // New prop to indicate tag match
}

const BusinessCard: React.FC<BusinessCardProps> = ({
  id,
  name,
  category,
  description,
  address,
  distance,
  rating,
  image,
  tags,
  tagMatches,
  isTagMatch
}) => {
  // Get the first 2 tags to display, prioritize matching tags
  const displayTags = tags || [];
  const displayTagMatches = tagMatches || [];
  
  // Determine which tags to show (up to 2), prioritizing matched tags
  const tagsToShow = [...displayTagMatches, ...displayTags.filter(tag => !displayTagMatches.includes(tag))].slice(0, 2);
  
  return (
    <Link to={`/location/${id}`}>
      <Card className="overflow-hidden h-full transition-all hover:shadow-md bg-white">
        <div className="relative">
          <img
            src={image}
            alt={name}
            className="w-full h-48 object-cover"
          />
          {isTagMatch && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-500 hover:bg-green-600">Tag Match</Badge>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <h3 className="text-white font-medium text-lg truncate">{name}</h3>
          </div>
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {category}
            </Badge>
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 mr-1 fill-yellow-500" />
              <span className="text-sm font-medium">{rating}</span>
            </div>
          </div>
          
          {description && (
            <p className="text-muted-foreground text-sm line-clamp-2 mb-2">{description}</p>
          )}
          
          {address && (
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{address}</span>
              {distance && <span className="ml-1 text-xs">({distance})</span>}
            </div>
          )}
          
          {tagsToShow.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tagsToShow.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className={displayTagMatches.includes(tag) 
                    ? "bg-green-100 text-green-800 border-green-200 font-medium" 
                    : "bg-gray-100"
                  }
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default BusinessCard;
