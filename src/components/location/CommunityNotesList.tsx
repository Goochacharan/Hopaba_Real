
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThumbsUp, FileText } from "lucide-react";
import CommunityNoteModal from "./CommunityNoteModal";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

interface CommunityNotesListProps {
  locationId: string;
}

interface Note {
  id: string;
  title: string;
  content: { text: string; videoUrl?: string };
  images: string[] | null;
  social_links: any[];
  thumbs_up_users: { user_id: string; rating: number }[] | null; // rating 1-5
  thumbs_up: number | null;
  user_id: string | null;
  user_avatar_url?: string | null;
  user_display_name?: string | null;
  created_at: string;
}

const MAX_THUMBS = 5;

const CommunityNotesList: React.FC<CommunityNotesListProps> = ({ locationId }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
    fetchUserId();
    // eslint-disable-next-line
  }, [locationId]);

  async function fetchUserId() {
    const { data } = await supabase.auth.getSession();
    setUserId(data.session?.user?.id ?? null);
  }

  // Fetch community notes with author avatar and display name
  async function fetchNotes() {
    setLoading(true);
    const { data, error } = await supabase
      .from("community_notes")
      .select(`
        *,
        user_id,
        thumbs_up_users,
        content,
        created_at
      `)
      .eq("location_id", locationId)
      .order("created_at", { ascending: false });
    if (error) {
      setNotes([]);
      setLoading(false);
      return;
    }
    // Fetch user profile pics and names for notes owners
    const userIds = data?.map((note) => note.user_id).filter(Boolean) || [];
    const uniqueUserIds = Array.from(new Set(userIds));
    const { data: usersData, error: userError } = await supabase
      .from("profiles")
      .select("id, avatar_url, full_name")
      .in("id", uniqueUserIds);
    if (userError) {
      // proceed without avatars if error
      setNotes(data);
      setLoading(false);
      return;
    }
    // Map user info by user id
    const userMap = new Map(
      (usersData || []).map((user) => [user.id, user])
    );
    // Enhance notes with user_avatar_url and display_name
    const enhancedNotes = (data || []).map((note) => ({
      ...note,
      user_avatar_url: note.user_id ? userMap.get(note.user_id)?.avatar_url : null,
      user_display_name: note.user_id ? userMap.get(note.user_id)?.full_name : "Anonymous",
      thumbs_up_users: note.thumbs_up_users || [],
    }));

    setNotes(enhancedNotes);
    setLoading(false);
  }

  // Compute overall thumbs up count as sum of user ratings
  const computeThumbsUpCount = (note: Note) => {
    return note.thumbs_up_users?.reduce((sum, u) => sum + u.rating, 0) || 0;
  };

  // Check if user already gave a thumbs up and at what value
  const userThumbRating = (note: Note, userId: string | null) => {
    if (!userId || !note.thumbs_up_users) return 0;
    const entry = note.thumbs_up_users.find(u => u.user_id === userId);
    return entry?.rating || 0;
  };

  // Handle rating: user can rate 1-5 individual thumbs
  async function handleThumb(noteId: string, rating: number) {
    if (!userId) {
      alert("You need to be logged in to rate articles.");
      return;
    }
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    const existingUserRating = userThumbRating(note, userId);
    if (existingUserRating !== 0) {
      // Allow update of rating? For simplicity, disallow multiple ratings or changes
      alert("You have already rated this article.");
      return;
    }
    if (rating < 1 || rating > MAX_THUMBS) return;

    // Add or update thumbs_up_users array
    const newThumbsUpUsers = [...note.thumbs_up_users, { user_id: userId, rating }];
    const totalThumbsUp = newThumbsUpUsers.reduce((sum, u) => sum + u.rating, 0);

    const { error } = await supabase
      .from("community_notes")
      .update({
        thumbs_up_users: newThumbsUpUsers,
        thumbs_up: totalThumbsUp,
      })
      .eq("id", noteId);

    if (!error) {
      setNotes(prev =>
        prev.map(n => n.id === noteId ? { ...n, thumbs_up_users: newThumbsUpUsers, thumbs_up: totalThumbsUp } : n)
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
          {notes.map(note => {
            const userRating = userThumbRating(note, userId);
            return (
              <div
                className="border p-3 rounded bg-white shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md"
                key={note.id}
                onClick={() => {
                  setSelectedNote(note);
                  setModalOpen(true);
                }}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {note.user_avatar_url ? (
                      <AvatarImage src={note.user_avatar_url} alt={note.user_display_name || "User avatar"} />
                    ) : (
                      <AvatarFallback>{(note.user_display_name?.[0] || "A").toUpperCase()}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="font-semibold text-lg">{note.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-1 max-w-[340px]">
                      {note.content?.text?.slice(0, 120)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <button
                      key={i}
                      onClick={e => {
                        e.stopPropagation();
                        handleThumb(note.id, i);
                      }}
                      className={`cursor-pointer ${
                        userRating >= i ? "text-blue-500" : "text-gray-300"
                      }`}
                      aria-label={`${i} thumbs up`}
                      title={`${i} thumbs up`}
                    >
                      <ThumbsUp size={20} />
                    </button>
                  ))}
                  <span className="font-bold ml-1">{computeThumbsUpCount(note)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {modalOpen && selectedNote && (
        <CommunityNoteModal
          note={selectedNote}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          thumbsUpCount={computeThumbsUpCount(selectedNote)}
          userHasThumbed={userThumbRating(selectedNote, userId) > 0}
          onThumb={handleThumb}
        />
      )}
    </div>
  );
};

export default CommunityNotesList;

