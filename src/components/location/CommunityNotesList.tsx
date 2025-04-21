
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThumbsUp, FileText } from "lucide-react";
import CommunityNoteModal from "./CommunityNoteModal";

interface CommunityNotesListProps {
  locationId: string;
}

const CommunityNotesList: React.FC<CommunityNotesListProps> = ({ locationId }) => {
  const [notes, setNotes] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
    fetchUserId();
    // eslint-disable-next-line
  }, [locationId]);

  async function fetchUserId() {
    const {
      data
    } = await supabase.auth.getSession();
    setUserId(data.session?.user?.id ?? null);
  }

  async function fetchNotes() {
    setLoading(true);
    const { data, error } = await supabase
      .from("community_notes")
      .select("*")
      .eq("location_id", locationId)
      .order("created_at", { ascending: false });
    if (!error) setNotes(data || []);
    setLoading(false);
  }

  // For thumbs up, user can only thumbs up once per note
  async function handleThumb(noteId: string) {
    if (!userId) {
      alert("You need to be logged in to rate articles.");
      return;
    }
    // Check if the user already thumbed up
    const note = notes.find(n => n.id === noteId);
    if (note && note.thumbs_up_users && Array.isArray(note.thumbs_up_users) && note.thumbs_up_users.includes(userId)) {
      return;
    }
    // Allow max 5 thumbs up per note
    const thumbsUpCount = (note?.thumbs_up_users?.length || 0);
    if (thumbsUpCount >= 5) {
      alert("5 is the maximum number of thumbs up for an article.");
      return;
    }
    // Update thumbs
    const { error, data } = await supabase
      .from("community_notes")
      .update({
        thumbs_up_users: [...(note?.thumbs_up_users || []), userId],
        thumbs_up: thumbsUpCount + 1,
      })
      .eq("id", noteId)
      .select();

    if (!error) {
      setNotes(prev =>
        prev.map(n => n.id === noteId ? { ...n, thumbs_up_users: [...(note?.thumbs_up_users || []), userId], thumbs_up: thumbsUpCount + 1 } : n)
      );
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-center">
        <span>Loading community notes...</span>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
        <FileText className="w-5 h-5" /> Community Notes ({notes.length})
      </h3>
      {notes.length === 0 ? (
        <div className="text-muted-foreground mb-6">No articles yet. Be the first to write a community note!</div>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map(note => (
            <div
              className="border p-3 rounded bg-white shadow-sm flex items-center justify-between hover:shadow-md cursor-pointer"
              key={note.id}
              onClick={() => {
                setSelectedNote(note);
                setModalOpen(true);
              }}
            >
              <div>
                <div className="font-semibold text-lg">{note.title}</div>
                <div className="text-sm text-gray-500 line-clamp-1 max-w-[340px]">{note.content?.text?.slice(0, 120)}</div>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp size={20} className="mr-1 text-blue-500" />
                <span className="font-bold mr-2">{note.thumbs_up ?? 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {modalOpen && selectedNote && (
        <CommunityNoteModal
          note={selectedNote}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          thumbsUpCount={selectedNote.thumbs_up || 0}
          userHasThumbed={selectedNote.thumbs_up_users?.includes?.(userId)}
          onThumb={handleThumb}
        />
      )}
    </div>
  );
};

export default CommunityNotesList;
