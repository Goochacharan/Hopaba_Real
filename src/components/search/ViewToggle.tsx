
import React from 'react';
import { Map as MapIcon, List } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';

interface ViewToggleProps {
  isMapView: boolean;
  onToggle: (value: boolean) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ isMapView, onToggle }) => {
  return (
    <div className="flex w-full max-w-[400px] rounded-lg border bg-card p-1">
      <Toggle
        pressed={!isMapView}
        onPressedChange={() => onToggle(false)}
        className="flex-1 rounded-l-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        <List className="h-4 w-4 mr-2" />
        List View
      </Toggle>
      <Toggle
        pressed={isMapView}
        onPressedChange={() => onToggle(true)}
        className="flex-1 rounded-r-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        <MapIcon className="h-4 w-4 mr-2" />
        Map View
      </Toggle>
    </div>
  );
};

export default ViewToggle;
