
import React from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { formatDistance } from "date-fns";
import { ScrollArea } from "../ui/scroll-area";
import { useNotes } from "@/hooks/useNotes";
import NoteContent from "./NoteContent";
import NoteAuthor from "./NoteAuthor";
import NoteActions from "./NoteActions";

interface CommunityNotesPopupProps {
  locationId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CommunityNotesPopup: React.FC<CommunityNotesPopupProps> = ({
  locationId,
  isOpen,
  onClose,
}) => {
  const {
    notes,
    loading,
    currentNoteIndex,
    userId,
    currentNote,
    isFirstNote,
    isLastNote,
    handleLikeNote,
    goToNextNote,
    goToPreviousNote,
    notesCount
  } = useNotes(locationId, isOpen);

  const formattedDate = currentNote?.created_at 
    ? formatDistance(new Date(currentNote.created_at), new Date(), { addSuffix: true })
    : '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[90vw] lg:max-w-[80vw] max-h-[90vh] p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center items-center">
            <p>Loading community notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="p-8 text-center">
            <p>No community notes found for this location.</p>
            <button onClick={onClose} className="mt-4">Close</button>
          </div>
        ) : (
          <div className="flex flex-col h-[80vh]">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-muted/30">
              <h2 className="text-xl font-bold">Community Notes</h2>
              <span className="text-sm text-muted-foreground">
                {currentNoteIndex + 1} of {notesCount}
              </span>
            </div>
            
            {/* Content */}
            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="p-6">
                {currentNote && (
                  <>
                    <NoteAuthor 
                      avatarUrl={currentNote.user_avatar_url}
                      displayName={currentNote.user_display_name}
                      date={formattedDate}
                    />
                    
                    <NoteContent 
                      title={currentNote.title}
                      content={currentNote.content}
                      images={currentNote.images}
                    />
                  </>
                )}
              </div>
            </ScrollArea>
            
            {/* Footer */}
            {currentNote && (
              <NoteActions 
                noteId={currentNote.id}
                thumbsUpCount={currentNote.thumbs_up}
                isLikedByUser={currentNote.thumbs_up_users?.includes(userId || '')}
                onLike={(e) => handleLikeNote(currentNote, e)}
                onPrevious={goToPreviousNote}
                onNext={goToNextNote}
                onClose={(e) => { e.stopPropagation(); onClose(); }}
                isFirstNote={isFirstNote}
                isLastNote={isLastNote}
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CommunityNotesPopup;
