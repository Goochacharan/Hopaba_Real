
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X, Edit2 } from 'lucide-react';

interface OwnershipEditorProps {
  isEditing: boolean;
  value: string;
  isCurrentUserSeller: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (value: string) => void;
  isUpdating: boolean;
}

const OwnershipEditor: React.FC<OwnershipEditorProps> = ({
  isEditing,
  value,
  isCurrentUserSeller,
  onEdit,
  onSave,
  onCancel,
  onChange,
  isUpdating
}) => {
  if (!isCurrentUserSeller) return null;

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 mb-2 bg-gray-50 p-3 rounded-lg border">
        <div className="flex-1">
          <label className="text-xs text-gray-500 block mb-1">Ownership Status</label>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select ownership" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1st">1st Owner</SelectItem>
              <SelectItem value="2nd">2nd Owner</SelectItem>
              <SelectItem value="3rd">3rd Owner</SelectItem>
              <SelectItem value="4th">4th Owner</SelectItem>
              <SelectItem value="5th+">5th+ Owner</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-1">
          <Button 
            onClick={onSave} 
            disabled={isUpdating} 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0"
          >
            <Check className="h-3.5 w-3.5 text-green-500" />
          </Button>
          <Button 
            onClick={onCancel} 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0"
          >
            <X className="h-3.5 w-3.5 text-red-500" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button 
      onClick={onEdit}
      variant="ghost" 
      size="sm" 
      className="h-8 px-2"
    >
      <Edit2 className="h-3.5 w-3.5 mr-1" />
      <span className="text-xs">Edit Owner</span>
    </Button>
  );
};

export default OwnershipEditor;
