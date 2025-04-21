
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThumbsUp, FileText } from "lucide-react";
import CommunityNoteModal from "./CommunityNoteModal";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Note, ThumbsUpUser } from "./CommunityNoteModal";
import { Json } from "@/integrations/supabase/types";

interface CommunityNotesListProps {
  locationId: string;
}

interface NoteContentType {
  text: string;
  videoUrl?: string;
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
      console.error("Error fetching notes:", error);
      setNotes([]);
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
      const processedNotes: Note[] = [];
      
      for (const note of data) {
        let userAvatarUrl: string | null = null;
        let userDisplayName: string | null = "Anonymous";
        
        if (note.user_id) {
          try {
            const { data: userData } = await supabase.auth.admin.getUserById(
              note.user_id
            );
            
            if (userData && userData.user) {
              userAvatarUrl = userData.user.user_metadata?.avatar_url || null;
              userDisplayName = userData.user.user_metadata?.full_name || userData.user.email || "Anonymous";
            }
          } catch (authError) {
            console.error("Could not fetch user data:", authError);
            userDisplayName = `User ${note.user_id.substring(0, 6)}`;
          }
        }
        
        const contentData = note.content as Json;
        let contentObj: NoteContentType;
        
        if (typeof contentData === 'string') {
          contentObj = { text: contentData };
        } else if (Array.isArray(contentData)) {
          contentObj = { text: 'No content available' };
        } else {
          const tempContent = contentData as unknown as { text: string; videoUrl?: string };
          contentObj = { 
            text: tempContent.text || 'No content available',
            videoUrl: tempContent.videoUrl
          };
        }
        
        // Properly handle thumbs_up_users based on its structure
        let thumbsUpUsers: ThumbsUpUser[] = [];
        const rawThumbsUpUsers = note.thumbs_up_users;
        
        if (rawThumbsUpUsers) {
          // Handle both array and non-array cases
          if (Array.isArray(rawThumbsUpUsers)) {
            thumbsUpUsers = rawThumbsUpUsers.map((user: any) => {
              if (typeof user === 'string') {
                return { user_id: user, rating: 1 };
              }
              return user as ThumbsUpUser;
            });
          } else if (typeof rawThumbsUpUsers === 'string') {
            // Handle case where it's a single string
            thumbsUpUsers = [{ user_id: rawThumbsUpUsers, rating: 1 }];
          } else if (typeof rawThumbsUpUsers === 'object' && rawThumbsUpUsers !== null) {
            // Handle object case
            const entries = Object.entries(rawThumbsUpUsers);
            thumbsUpUsers = entries.map(([key, value]) => {
              return { user_id: key, rating: typeof value === 'number' ? value : 1 };
            });
          }
        }
        
        // Handle social_links properly
        let socialLinks: any[] = [];
        if (note.social_links) {
          if (Array.isArray(note.social_links)) {
            socialLinks = note.social_links;
          } else if (typeof note.social_links === 'object') {
            socialLinks = Object.values(note.social_links);
          }
        }
        
        processedNotes.push({
          ...note,
          content: contentObj,
          user_avatar_url: userAvatarUrl,
          user_display_name: userDisplayName,
          thumbs_up_users: thumbsUpUsers,
          social_links: socialLinks
        });
      }
      
      setNotes(processedNotes);
    } else {
      setNotes([]);
    }
    
    setLoading(false);
  }

  const computeThumbsUpCount = (note: Note) => {
    if (!note.thumbs_up_users || note.thumbs_up_users.length === 0) return 0;
    return note.thumbs_up_users.reduce((sum, u) => sum + u.rating, 0);
  };

  const userThumbRating = (note: Note, userId: string | null) => {
    if (!userId || !note.thumbs_up_users) return 0;
    const entry = note.thumbs_up_users.find(u => u.user_id === userId);
    return entry?.rating || 0;
  };

  async function handleThumb(noteId: string, rating: number) {
    if (!userId) {
      alert("You need to be logged in to rate articles.");
      return;
    }
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    const existingUserRating = userThumbRating(note, userId);
    if (existingUserRating !== 0) {
      alert("You have already rated this article.");
      return;
    }
    if (rating < 1 || rating > MAX_THUMBS) return;

    const newThumbsUpUsers = [...(note.thumbs_up_users || [])];
    newThumbsUpUsers.push({ user_id: userId, rating });
    const totalThumbsUp = newThumbsUpUsers.reduce((sum, u) => sum + u.rating, 0);

    // Convert the ThumbsUpUser[] to a format compatible with the database
    const thumbsUpUsersForDb: { user_id: string, rating: number }[] = newThumbsUpUsers.map(u => ({ 
      user_id: u.user_id, 
      rating: u.rating 
    }));

    const { error } = await supabase
      .from("community_notes")
      .update({
        thumbs_up_users: thumbsUpUsersForDb as unknown as Json,
        thumbs_up: totalThumbsUp,
      })
      .eq("id", noteId);

    if (!error) {
      setNotes(prev =>
        prev.map(n => n.id === noteId ? { 
          ...n, 
          thumbs_up_users: newThumbsUpUsers, 
          thumbs_up: totalThumbsUp 
        } : n)
      );
    } else {
      console.error("Error updating rating:", error);
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
            const totalThumbsUp = computeThumbsUpCount(note);
            
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
                      disabled={userRating > 0}
                    >
                      <ThumbsUp size={20} />
                    </button>
                  ))}
                  <span className="font-bold ml-1">{totalThumbsUp}</span>
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
