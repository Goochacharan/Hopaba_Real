
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText } from "lucide-react";
import CommunityNoteModal from "./CommunityNoteModal";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Note } from "./CommunityNoteModal";
import { Json } from "@/integrations/supabase/types";

interface CommunityNotesListProps {
  locationId: string;
}

interface NoteContentType {
  text: string;
  videoUrl?: string;
}

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
    console.log("Fetching notes for location:", locationId);
    
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

    console.log("Notes data from database:", data);
    
    if (data && data.length > 0) {
      const processedNotes: Note[] = [];
      
      for (const note of data) {
        let userAvatarUrl: string | null = null;
        let userDisplayName: string | null = "Anonymous";
        
        if (note.user_id) {
          try {
            // Using getUser instead of admin.getUserById which might not be accessible
            const { data: userData } = await supabase.auth.getUser(note.user_id);
            
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
          social_links: socialLinks
        });
      }
      
      console.log("Processed notes:", processedNotes);
      setNotes(processedNotes);
    } else {
      console.log("No notes found for this location");
      setNotes([]);
    }
    
    setLoading(false);
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
            </div>
          ))}
        </div>
      )}
      {modalOpen && selectedNote && (
        <CommunityNoteModal
          note={selectedNote}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

export default CommunityNotesList;
