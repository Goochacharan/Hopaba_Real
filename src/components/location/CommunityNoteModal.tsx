
import React from "react";
import { ThumbsUp } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Json } from "@/integrations/supabase/types";

interface NoteContentType {
  text: string;
  videoUrl?: string;
}

export interface ThumbsUpUser {
  user_id: string;
  rating: number;
}

export interface Note {
  id: string;
  title: string;
  content: NoteContentType;
  images: string[] | null;
  social_links: any[]; // Using any[] to accommodate different formats
  user_id: string | null;
  user_avatar_url?: string | null;
  user_display_name?: string | null;
  thumbs_up?: number | null;
  thumbs_up_users?: ThumbsUpUser[] | null;
  created_at?: string;
}

interface CommunityNoteModalProps {
  note: Note;
  open: boolean;
  onClose: () => void;
  onThumb: (noteId: string, rating: number) => void;
  thumbsUpCount: number;
  userHasThumbed: boolean;
}

const MAX_THUMBS = 5;

const isYouTubeUrl = (url: string) => {
  const ytRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/;
  return ytRegex.test(url);
};

const isVimeoUrl = (url: string) => {
  const vimeoRegex = /^(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)([^\s&]+)/;
  return vimeoRegex.test(url);
};

const getYouTubeEmbedUrl = (url: string) => {
  const match = url.match(/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : "";
};

const getVimeoEmbedUrl = (url: string) => {
  const match = url.match(/^(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)([^\s&]+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : "";
};

const CommunityNoteModal: React.FC<CommunityNoteModalProps> = ({
  note, open, onClose, onThumb, thumbsUpCount, userHasThumbed
}) => {
  if (!open || !note) return null;

  const userAvatarUrl = note.user_avatar_url;
  const userDisplayName = note.user_display_name || "Anonymous";

  const videoUrl = note.content?.videoUrl || null;
  
  // Determine which video service to use
  const getEmbedUrl = (url: string | null) => {
    if (!url) return null;
    if (isYouTubeUrl(url)) return getYouTubeEmbedUrl(url);
    if (isVimeoUrl(url)) return getVimeoEmbedUrl(url);
    return null;
  };
  
  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto relative p-6">
        <button
          className="absolute top-2 right-3 font-bold text-2xl text-gray-400"
          onClick={onClose}
          aria-label="Close popup"
        >
          &times;
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-10 w-10">
            {userAvatarUrl ? (
              <AvatarImage src={userAvatarUrl} alt={userDisplayName} />
            ) : (
              <AvatarFallback>{(userDisplayName[0] || "A").toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{note.title}</h2>
            <div className="text-sm text-gray-500">{userDisplayName}</div>
          </div>
        </div>

        {videoUrl && embedUrl && (
          <div className="w-full aspect-video mb-6 rounded-lg overflow-hidden">
            <iframe
              src={embedUrl}
              title="Video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        )}

        {note.images && note.images.length > 0 && (
          <div className="mb-6 space-y-4">
            {note.images.map((img: string, idx: number) => (
              <img 
                key={idx} 
                src={img} 
                alt={`Image ${idx + 1} for ${note.title}`}
                className="w-full rounded-lg object-contain max-h-[600px]"
              />
            ))}
          </div>
        )}
        
        <div className="prose prose-lg max-w-none mb-6 min-h-[200px]" style={{ whiteSpace: "pre-wrap" }}>
          {note.content?.text}
        </div>
        
        {note.social_links && Array.isArray(note.social_links) && note.social_links.length > 0 ? (
          <div className="mb-3">
            <label className="font-semibold">Links:</label>
            <ul className="ml-4 mt-1">
              {note.social_links.map((link: any, i: number) => (
                <li key={i}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {link.label || link.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mb-3 flex items-center gap-1">
          <span className="font-semibold">Rate this article:</span>
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              disabled={userHasThumbed}
              onClick={() => onThumb(note.id, i)}
              className={`cursor-pointer px-2 py-1 rounded ${
                userHasThumbed ? "bg-blue-100 text-blue-500" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
              aria-label={`${i} thumbs up`}
              title={`${i} thumbs up`}
            >
              <ThumbsUp size={18} />
            </button>
          ))}
          <span className="ml-3 font-bold text-lg">{thumbsUpCount}</span>
          {userHasThumbed && <span className="ml-2 text-green-600 font-semibold">Thank you!</span>}
        </div>
      </div>
    </div>
  );
};

export default CommunityNoteModal;
