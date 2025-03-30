
import React from 'react';
import { format, differenceInDays } from 'date-fns';
import { Instagram, Film, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ListingDescriptionProps {
  description: string;
  category: string;
  condition: string;
  location: string;
  createdAt: string;
  instagram?: string | null;
  showMetadata?: boolean;
}

const ListingDescription: React.FC<ListingDescriptionProps> = ({
  description,
  category,
  condition,
  location,
  createdAt,
  instagram,
  showMetadata = false
}) => {
  const isVideoContent = instagram && (
    instagram.includes('youtube.com') || 
    instagram.includes('vimeo.com') || 
    instagram.includes('tiktok.com')
  );

  // Check if listing is less than 7 days old
  const isNew = differenceInDays(new Date(), new Date(createdAt)) < 7;

  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold mb-3">Description</h2>
        {isNew && (
          <div className="bg-[#33C3F0] text-white text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1 mb-3">
            <Sparkles className="h-2.5 w-2.5" />
            <span className="text-[10px]">New post</span>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <ScrollArea className="h-56 pr-3">
          <p className="text-muted-foreground whitespace-pre-line leading-relaxed text-base font-normal">
            {description}
          </p>
        </ScrollArea>
        
        {showMetadata && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-y-3">
              <div className="text-sm font-medium">Category</div>
              <div className="text-sm text-muted-foreground">{category}</div>
              
              <div className="text-sm font-medium">Condition</div>
              <div className="text-sm text-muted-foreground">{condition}</div>
              
              <div className="text-sm font-medium">Location</div>
              <div className="text-sm text-muted-foreground">{location}</div>
              
              {instagram && (
                <>
                  <div className="text-sm font-medium flex items-center gap-1.5">
                    <Instagram className="h-4 w-4" />
                    {isVideoContent ? 'Video Content' : 'Instagram'}
                    {isVideoContent && <Film className="h-3.5 w-3.5 text-purple-500" />}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {instagram}
                  </div>
                </>
              )}
              
              <div className="text-sm font-medium">Listed on</div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(createdAt), 'PPP')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingDescription;
