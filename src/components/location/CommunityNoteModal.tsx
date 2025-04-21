
import React from "react";
import { ThumbsUp } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

interface CommunityNoteModalProps {
  note: any;
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

const getYouTubeEmbedUrl = (url: string) => {
  const match = url.match(/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : "";
};

const CommunityNoteModal: React.FC<CommunityNoteModalProps> = ({
  note, open, onClose, onThumb, thumbsUpCount, userHasThumbed
}) => {
  if (!open || !note) return null;

  const userRating = userHasThumbed ? 1 : 0; // The rating is not passed deeply, so using boolean for now.

  const userAvatarUrl = note.user_avatar_url;
  const userDisplayName = note.user_display_name || "Anonymous";

  const videoUrl = note.content?.videoUrl || null;

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
          <h2 className="text-2xl font-bold">{note.title}</h2>
        </div>

        {videoUrl && isYouTubeUrl(videoUrl) && (
          <div className="w-full aspect-video rounded-md overflow-hidden mb-4">
            <iframe
              src={getYouTubeEmbedUrl(videoUrl)}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        )}

        {note.images && note.images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {note.images.map((img: string, idx: number) => (
              <img key={idx} src={img} className="w-32 h-20 object-cover rounded border" />
            ))}
          </div>
        )}
        <div className="prose prose-lg mb-4" style={{ whiteSpace: "pre-wrap" }}>
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

