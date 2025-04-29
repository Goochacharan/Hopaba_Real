
import React from 'react';
import { Check } from 'lucide-react';

export const VerifiedMark: React.FC = () => {
  return (
    <span className="inline-flex items-center justify-center rounded-full bg-primary/10 p-1 text-primary">
      <Check className="h-3 w-3" />
    </span>
  );
};
