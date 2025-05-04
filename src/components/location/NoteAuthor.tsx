
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface NoteAuthorProps {
  avatarUrl: string | null;
  displayName: string;
  date: string;
}

const NoteAuthor: React.FC<NoteAuthorProps> = ({ avatarUrl, displayName, date }) => {
  return (
    <div className="flex items-start gap-4 mb-4">
      <Avatar className="h-10 w-10">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={displayName || "User avatar"} />
        ) : (
          <AvatarFallback>{(displayName?.[0] || "A").toUpperCase()}</AvatarFallback>
        )}
      </Avatar>
      <div>
        <div className="font-semibold">{displayName}</div>
        <div className="text-sm text-muted-foreground">{date}</div>
      </div>
    </div>
  );
};

export default NoteAuthor;
