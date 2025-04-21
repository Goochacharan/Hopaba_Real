
import React from "react";
import { ThumbsUp } from "lucide-react";

interface CommunityNoteModalProps {
  note: any;
  open: boolean;
  onClose: () => void;
  onThumb: (noteId: string) => void;
  thumbsUpCount: number;
  userHasThumbed: boolean;
}

const CommunityNoteModal: React.FC<CommunityNoteModalProps> = ({
  note, open, onClose, onThumb, thumbsUpCount, userHasThumbed
}) => {
  if (!open || !note) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto relative p-8">
        <button
          className="absolute top-2 right-3 font-bold text-2xl text-gray-400"
          onClick={onClose}
          aria-label="Close popup"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4">{note.title}</h2>
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
        {note.social_links && Array.isArray(note.social_links) ? (
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
        <div className="mb-3">
          <span className="font-semibold">Thumbs Up:</span>
          <button onClick={() => onThumb(note.id)} disabled={userHasThumbed} className="ml-2 inline-flex items-center px-2 py-1 rounded bg-blue-100 hover:bg-blue-200">
            <ThumbsUp className={`mr-1 ${userHasThumbed ? "text-blue-500" : "text-gray-700"}`} size={18} />
            <span className="font-bold">{thumbsUpCount}</span>
            {userHasThumbed && <span className="ml-1 text-green-600 font-semibold">Thank you!</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityNoteModal;
