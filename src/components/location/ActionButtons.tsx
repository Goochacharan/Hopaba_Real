
import React from 'react';
import { Phone, MessageCircle, Navigation2, Share2 } from 'lucide-react';

interface ActionButtonsProps {
  onCall: (e: React.MouseEvent) => void;
  onWhatsApp: (e: React.MouseEvent) => void;
  onDirections: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCall,
  onWhatsApp,
  onDirections,
  onShare
}) => {
  return (
    <div className="flex gap-2 mt-4">
      <button 
        onClick={onCall} 
        className="flex-1 h-10 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center"
      >
        <Phone className="h-5 w-5" />
      </button>
      <button 
        onClick={onWhatsApp} 
        className="flex-1 h-10 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
      <button 
        onClick={onDirections} 
        className="flex-1 h-10 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center"
      >
        <Navigation2 className="h-5 w-5" />
      </button>
      <button 
        onClick={onShare} 
        className="flex-1 h-10 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center"
      >
        <Share2 className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ActionButtons;
