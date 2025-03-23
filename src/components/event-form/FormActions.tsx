
import React from 'react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  loading: boolean;
  isEditing: boolean;
  onCancel?: () => void;
}

export const FormActions: React.FC<FormActionsProps> = ({ loading, isEditing, onCancel }) => {
  return (
    <div className="flex gap-3 justify-end">
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : isEditing ? "Update Event" : "Create Event"}
      </Button>
    </div>
  );
};
