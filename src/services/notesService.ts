
import { supabase } from "@/integrations/supabase/client";

export interface CommunityNote {
  id: string;
  title: string;
  content: {
    text: string;
    videoUrl?: string;
  };
  created_at: string;
  thumbs_up: number;
  thumbs_up_users: string[];
  user_id: string;
  user_avatar_url: string | null;
  user_display_name: string;
  images?: string[];
}

export const fetchCommunityNotes = async (locationId: string): Promise<CommunityNote[]> => {
  const { data, error } = await supabase
    .from("community_notes")
    .select(`
      *,
      user_id,
      thumbs_up_users,
      content,
      images,
      created_at
    `)
    .eq("location_id", locationId)
    .order("thumbs_up", { ascending: false });

  if (error) {
    console.error("Error fetching notes:", error);
    return [];
  }

  if (data && data.length > 0) {
    const processedNotes: CommunityNote[] = [];
    
    for (const note of data) {
      let userAvatarUrl: string | null = null;
      let userDisplayName: string | null = "Anonymous";
      
      if (note.user_id) {
        try {
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
      
      const contentData = note.content;
      let contentObj: { text: string; videoUrl?: string };
      
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
      
      processedNotes.push({
        ...note,
        content: contentObj,
        user_avatar_url: userAvatarUrl,
        user_display_name: userDisplayName,
      });
    }
    
    return processedNotes;
  } else {
    return [];
  }
};

export const updateNoteLikes = async (
  noteId: string, 
  userId: string | null, 
  userLiked: boolean, 
  currentLikes: number, 
  currentLikeUsers: string[]
): Promise<{ success: boolean; newLikeCount: number; newLikeUsers: string[] }> => {
  if (!userId) {
    return { success: false, newLikeCount: currentLikes, newLikeUsers: currentLikeUsers };
  }

  const newLikeCount = userLiked ? (currentLikes || 0) - 1 : (currentLikes || 0) + 1;
  const newLikeUsers = userLiked 
    ? (currentLikeUsers || []).filter(id => id !== userId)
    : [...(currentLikeUsers || []), userId];

  const { error } = await supabase
    .from('community_notes')
    .update({
      thumbs_up: newLikeCount,
      thumbs_up_users: newLikeUsers
    })
    .eq('id', noteId);

  if (error) {
    console.error('Error updating likes:', error);
    return { success: false, newLikeCount: currentLikes, newLikeUsers: currentLikeUsers };
  }

  return { success: true, newLikeCount, newLikeUsers };
};
