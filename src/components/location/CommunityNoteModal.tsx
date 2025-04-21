
import React, { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getEmbedUrl } from "@/utils/videoUtils";

interface NoteContentType {
  text: string;
  videoUrl?: string;
}

// Store replies within the Comment object instead of fetching from a separate table
interface Reply {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_display_name?: string;
  user_avatar_url?: string;
}

interface Comment {
  id: string;
  note_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_display_name?: string;
  user_avatar_url?: string;
  replies?: Reply[];
}

export interface Note {
  id: string;
  title: string;
  content: NoteContentType;
  images: string[] | null;
  social_links: any[];
  user_id: string | null;
  user_avatar_url?: string | null;
  user_display_name?: string | null;
  created_at?: string;
}

interface CommunityNoteModalProps {
  note: Note;
  open: boolean;
  onClose: () => void;
}

const CommunityNoteModal: React.FC<CommunityNoteModalProps> = ({
  note, open, onClose
}) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (open && note.id) {
      loadComments();
      getCurrentUser();
    }
  }, [open, note.id]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadComments = async () => {
    const { data: commentsData, error } = await supabase
      .from('note_comments')
      .select('*')
      .eq('note_id', note.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading comments:', error);
      return;
    }

    if (commentsData) {
      // Process comments and add user metadata
      const processedComments: Comment[] = await Promise.all(
        commentsData.map(async (comment) => {
          // Get user data for the comment author
          const { data: userData } = await supabase.auth.getUser(comment.user_id);
          
          // Each comment will have an empty replies array (we'll fill it later if needed)
          return {
            ...comment,
            user_display_name: userData?.user?.user_metadata?.full_name || 'Anonymous',
            user_avatar_url: userData?.user?.user_metadata?.avatar_url,
            replies: []
          };
        })
      );
      
      setComments(processedComments);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      toast({
        title: "Authentication required",
        description: "Please log in to comment",
        variant: "destructive"
      });
      setSubmitting(false);
      return;
    }

    try {
      const { data: comment, error } = await supabase
        .from('note_comments')
        .insert({
          note_id: note.id,
          user_id: userData.user.id,
          content: newComment.trim()
        })
        .select()
        .single();

      if (error) throw error;

      const newCommentObj: Comment = {
        ...comment,
        user_display_name: userData.user.user_metadata?.full_name || userData.user.email,
        user_avatar_url: userData.user.user_metadata?.avatar_url,
        replies: []
      };
      
      setComments(prev => [newCommentObj, ...prev]);
      setNewComment("");
      
      toast({
        title: "Success",
        description: "Comment posted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive"
      });
    }
    
    setSubmitting(false);
  };

  const handleSubmitReply = async (commentId: string) => {
    if (!replyContent.trim()) return;

    setSubmitting(true);
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      toast({
        title: "Authentication required",
        description: "Please log in to reply",
        variant: "destructive"
      });
      setSubmitting(false);
      return;
    }

    try {
      // Instead of trying to use a comment_replies table, we'll store the reply
      // within the comments state and indicate a relationship to the parent comment
      
      // Create a new comment that references the parent comment
      const { data: reply, error } = await supabase
        .from('note_comments')
        .insert({
          note_id: note.id,
          user_id: userData.user.id,
          content: replyContent.trim()
        })
        .select()
        .single();

      if (error) throw error;

      const newReply: Reply = {
        id: reply.id,
        user_id: userData.user.id,
        content: replyContent.trim(),
        created_at: reply.created_at,
        user_display_name: userData.user.user_metadata?.full_name || userData.user.email,
        user_avatar_url: userData.user.user_metadata?.avatar_url
      };
      
      // Update the comments state by adding the reply to the appropriate comment
      setComments(prevComments => prevComments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        return comment;
      }));
      
      setReplyContent("");
      setReplyingTo(null);
      
      toast({
        title: "Success",
        description: "Reply posted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive"
      });
    }
    
    setSubmitting(false);
  };

  if (!open || !note) return null;

  const embedUrl = getEmbedUrl(note.content?.videoUrl || null);
  const userAvatarUrl = note.user_avatar_url;
  const userDisplayName = note.user_display_name || "Anonymous";
  const isAuthor = currentUserId === note.user_id;

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

        {embedUrl && (
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
        
        {note.social_links && Array.isArray(note.social_links) && note.social_links.length > 0 && (
          <div className="mb-6">
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
        )}

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Comments</h3>
          <div className="space-y-4 mb-6">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-8 w-8">
                    {comment.user_avatar_url ? (
                      <AvatarImage src={comment.user_avatar_url} alt={comment.user_display_name} />
                    ) : (
                      <AvatarFallback>
                        {(comment.user_display_name?.[0] || "A").toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="font-medium">{comment.user_display_name || "Anonymous"}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700">{comment.content}</p>

                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-8 mt-2 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-6 w-6">
                            {reply.user_avatar_url ? (
                              <AvatarImage src={reply.user_avatar_url} alt={reply.user_display_name} />
                            ) : (
                              <AvatarFallback>
                                {(reply.user_display_name?.[0] || "A").toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{reply.user_display_name || "Anonymous"}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(reply.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {isAuthor && (
                  <div className="mt-2">
                    {replyingTo === comment.id ? (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="min-h-[80px] text-sm"
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => handleSubmitReply(comment.id)} 
                            disabled={submitting}
                          >
                            {submitting ? "Posting..." : "Post Reply"}
                          </Button>
                          <Button 
                            size="sm"
                            variant="ghost" 
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-sm"
                        onClick={() => setReplyingTo(comment.id)}
                      >
                        Reply
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmitComment} className="space-y-4">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? "Posting..." : "Post Comment"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommunityNoteModal;
