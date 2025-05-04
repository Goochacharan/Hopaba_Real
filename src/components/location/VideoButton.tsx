
import React from 'react';
import { Film } from 'lucide-react';

interface VideoButtonProps {
  hasInstagram: boolean;
  instagram?: string;
  businessName: string;
  onInstagramClick: (e: React.MouseEvent, instagram: string | undefined, businessName: string) => void;
}

const VideoButton: React.FC<VideoButtonProps> = ({
  hasInstagram,
  instagram,
  businessName,
  onInstagramClick
}) => {
  if (!hasInstagram) return null;
  
  return (
    <button 
      onClick={e => onInstagramClick(e, instagram, businessName)} 
      title="Watch video content" 
      className="bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 hover:shadow-md transition-all ml-2 p-1.5 flex items-center rounded py-[4px] mx-[2px] px-[15px]"
    >
      <Film className="h-4 w-4 text-white mr-1" />
      <span className="text-white text-xs font-medium">Video</span>
    </button>
  );
};

export default VideoButton;
