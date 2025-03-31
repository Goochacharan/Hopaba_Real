import React from 'react';
import { format, differenceInDays } from 'date-fns';
import { Instagram, Film, Sparkles, MapPin, Link2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
interface ListingDescriptionProps {
  description: string;
  category: string;
  condition: string;
  location: string;
  createdAt: string;
  instagram?: string | null;
  mapLink?: string | null;
  showMetadata?: boolean;
}
const ListingDescription: React.FC<ListingDescriptionProps> = ({
  description,
  category,
  condition,
  location,
  createdAt,
  instagram,
  mapLink,
  showMetadata = false
}) => {
  const isVideoContent = instagram && (instagram.includes('youtube.com') || instagram.includes('vimeo.com') || instagram.includes('tiktok.com'));

  // Check if listing is less than 7 days old
  const isNew = differenceInDays(new Date(), new Date(createdAt)) < 7;
  return <div className="bg-white rounded-xl border p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold mb-3">Description</h2>
        {isNew && <div className="bg-[#33C3F0] text-white text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1 mb-3">
            <Sparkles className="h-2.5 w-2.5" />
            <span className="text-[10px]">New post</span>
          </div>}
      </div>
      
      <div className="space-y-4">
        <ScrollArea className="h-96 pr-3">
          <p className="whitespace-pre-line leading-relaxed text-base font-normal text-slate-900">
            {description}
          </p>
        </ScrollArea>
      </div>
    </div>;
};
export default ListingDescription;