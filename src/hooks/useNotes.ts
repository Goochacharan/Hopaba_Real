
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchCommunityNotes, updateNoteLikes, CommunityNote } from "@/services/notesService";
import { useToast } from "@/hooks/use-toast";

export const useNotes = (locationId: string, isOpen: boolean) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState<CommunityNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchUserId = async () => {
    const { data } = await supabase.auth.getSession();
    setUserId(data.session?.user?.id ?? null);
  };

  const loadNotes = async () => {
    if (!locationId) return;
    
    setLoading(true);
    const notesData = await fetchCommunityNotes(locationId);
    setNotes(notesData);
    setCurrentNoteIndex(0);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchUserId();
      loadNotes();
    }
  }, [isOpen, locationId]);
  
  const handleLikeNote = async (note: CommunityNote, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please log in to like notes",
        variant: "destructive"
      });
      return;
    }

    const userLiked = note.thumbs_up_users?.includes(userId);
    
    const { success, newLikeCount, newLikeUsers } = await updateNoteLikes(
      note.id, 
      userId, 
      userLiked, 
      note.thumbs_up, 
      note.thumbs_up_users
    );

    if (!success) {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
      return;
    }

    setNotes(prevNotes => {
      const updatedNotes = prevNotes.map(n => {
        if (n.id === note.id) {
          return {
            ...n,
            thumbs_up: newLikeCount,
            thumbs_up_users: newLikeUsers
          };
        }
        return n;
      });
      
      // Sort by likes after update
      return [...updatedNotes].sort((a, b) => (b.thumbs_up || 0) - (a.thumbs_up || 0));
    });
  };

  const goToNextNote = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (currentNoteIndex < notes.length - 1) {
      setCurrentNoteIndex(prev => prev + 1);
    }
  };

  const goToPreviousNote = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (currentNoteIndex > 0) {
      setCurrentNoteIndex(prev => prev - 1);
    }
  };

  return {
    notes,
    loading,
    currentNoteIndex,
    userId,
    currentNote: notes[currentNoteIndex],
    isFirstNote: currentNoteIndex === 0,
    isLastNote: currentNoteIndex >= notes.length - 1,
    handleLikeNote,
    goToNextNote,
    goToPreviousNote,
    notesCount: notes.length
  };
};
