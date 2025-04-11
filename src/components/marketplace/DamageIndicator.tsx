
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DamageIndicatorProps {
  damageCount: number;
  className?: string;
}

const DamageIndicator: React.FC<DamageIndicatorProps> = ({ damageCount, className }) => {
  if (!damageCount) return null;
  
  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium text-amber-500 mt-1",
        className
      )}
      title={`${damageCount} damage/scratch photo${damageCount > 1 ? 's' : ''} available`}
    >
      <AlertTriangle size={14} />
      <span>{damageCount} damage photo{damageCount > 1 ? 's' : ''}</span>
    </div>
  );
};

export default DamageIndicator;
