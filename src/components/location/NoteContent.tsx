
import React from "react";
import { getEmbedUrl } from "@/utils/videoUtils";

interface NoteContentProps {
  title: string;
  content: {
    text: string;
    videoUrl?: string;
  };
  images?: string[];
}

const NoteContent: React.FC<NoteContentProps> = ({ title, content, images }) => {
  const embedUrl = content?.videoUrl ? getEmbedUrl(content.videoUrl) : null;

  return (
    <>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      
      {/* Video embed */}
      {embedUrl && (
        <div className="mb-6 w-full aspect-video rounded overflow-hidden">
          <iframe 
            src={embedUrl} 
            title="Embedded video"
            className="w-full h-full"
            allowFullScreen
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )}
      
      {/* Images */}
      {images && images.length > 0 && (
        <div className="mb-6 space-y-4">
          {images.map((img, idx) => (
            <img 
              key={idx} 
              src={img} 
              alt={`Image ${idx + 1} for ${title}`} 
              className="w-full rounded-lg object-contain max-h-[600px]" 
            />
          ))}
        </div>
      )}
      
      <div className="prose max-w-none mb-6">
        <p>{content.text}</p>
      </div>
    </>
  );
};

export default NoteContent;
