
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface EmptyStateAction {
  label: string;
  href: string;
}

interface EmptyStateProps {
  title: string;
  description: string;
  action?: EmptyStateAction;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-lg bg-background">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 text-primary"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      {action && (
        <Button asChild>
          <Link to={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
};
