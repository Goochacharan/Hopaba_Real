
import React from "react";
import { Button } from "../ui/button";
import { ThumbsUp, ChevronLeft, ChevronRight } from "lucide-react";

interface NoteActionsProps {
  noteId: string;
  thumbsUpCount: number;
  isLikedByUser: boolean;
  onLike: (e: React.MouseEvent) => void;
  onPrevious: (e: React.MouseEvent) => void;
  onNext: (e: React.MouseEvent) => void;
  onClose: (e: React.MouseEvent) => void;
  isFirstNote: boolean;
  isLastNote: boolean;
}

const NoteActions: React.FC<NoteActionsProps> = ({
  thumbsUpCount,
  isLikedByUser,
  onLike,
  onPrevious,
  onNext,
  onClose,
  isFirstNote,
  isLastNote
}) => {
  return (
    <div className="p-4 border-t flex justify-between items-center bg-muted/10">
      <Button
        variant="ghost"
        size="sm"
        onClick={onLike}
        className={`flex items-center gap-1 ${
          isLikedByUser ? 'text-blue-600' : ''
        }`}
      >
        <ThumbsUp className="w-4 h-4" />
        <span>{thumbsUpCount || 0}</span>
      </Button>
      
      <div className="flex items-center gap-2">
        <Button 
          onClick={onPrevious}
          disabled={isFirstNote}
          variant="outline"
          size="sm"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <Button 
          onClick={onNext}
          disabled={isLastNote}
          variant="outline"
          size="sm"
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
        <Button 
          onClick={onClose}
          variant="default"
          size="sm"
          className="ml-2"
        >
          Close
        </Button>
      </div>
    </div>
  );
};

export default NoteActions;
