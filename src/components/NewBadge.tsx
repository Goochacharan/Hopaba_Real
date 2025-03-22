
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NewBadgeProps {
  createdAt: string;
  className?: string;
}

const NewBadge: React.FC<NewBadgeProps> = ({ createdAt, className }) => {
  // Check if the item is less than a week old
  const isNew = () => {
    const creationDate = new Date(createdAt);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return creationDate > oneWeekAgo;
  };

  if (!isNew()) return null;

  return (
    <Badge 
      variant="default" 
      className={cn(
        "absolute top-2 right-2 bg-green-500 hover:bg-green-600 z-10 px-2 py-1", 
        className
      )}
    >
      NEW
    </Badge>
  );
};

export default NewBadge;
