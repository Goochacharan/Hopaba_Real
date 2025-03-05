
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { MapPin, Star, ExternalLink, Clock } from 'lucide-react';
import { Recommendation } from '@/lib/mockData';

interface LocationCardProps {
  recommendation: Recommendation;
  className?: string;
}

const LocationCard: React.FC<LocationCardProps> = ({ 
  recommendation, 
  className 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div 
      className={cn(
        "group bg-white rounded-xl border border-border/50 overflow-hidden transition-all-300",
        "hover:shadow-lg hover:border-primary/20 hover:scale-[1.01]",
        className
      )}
    >
      <div className="relative w-full h-48 overflow-hidden">
        <div className={cn(
          "absolute inset-0 bg-muted/30",
          imageLoaded ? "opacity-0" : "opacity-100"
        )} />
        <img
          src={recommendation.image}
          alt={recommendation.name}
          onLoad={() => setImageLoaded(true)}
          className={cn(
            "w-full h-full object-cover transition-all-500",
            imageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
          )}
        />
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-black/40 backdrop-blur-sm text-white">
            {recommendation.category}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg">{recommendation.name}</h3>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="fill-amber-500 w-4 h-4" />
            <span className="text-sm">{recommendation.rating}</span>
          </div>
        </div>

        <div className="flex items-center text-muted-foreground mb-3 text-sm">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="truncate">{recommendation.address}</span>
        </div>

        {recommendation.openNow !== undefined && (
          <div className="flex items-center text-sm mb-3">
            <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className={recommendation.openNow ? "text-emerald-600" : "text-rose-600"}>
              {recommendation.openNow ? "Open now" : "Closed"}
            </span>
            {recommendation.hours && (
              <span className="text-muted-foreground ml-1">
                {recommendation.hours}
              </span>
            )}
          </div>
        )}

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {recommendation.description}
        </p>

        <div className="flex gap-2 mt-auto">
          {recommendation.tags.map((tag, index) => (
            <span 
              key={index} 
              className="bg-secondary text-xs px-2 py-1 rounded-full text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 bg-secondary/50 border-t border-border/50 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {recommendation.distance}
        </div>
        <a 
          href="#" 
          className="text-primary text-sm font-medium flex items-center gap-1 hover:underline"
        >
          View More
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default LocationCard;
