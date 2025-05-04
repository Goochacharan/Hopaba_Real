
import React from 'react';
import { Phone, MessageCircle, Navigation2, Share2 } from 'lucide-react';

interface LocationActionButtonsProps {
  onCall: (e: React.MouseEvent) => void;
  onWhatsApp: (e: React.MouseEvent) => void;
  onDirections: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
}

const LocationActionButtons: React.FC<LocationActionButtonsProps> = ({
  onCall,
  onWhatsApp,
  onDirections,
  onShare
}) => {
  return (
    <div className="flex gap-2 mt-4">
      <button 
        onClick={onCall} 
        className="flex-1 h-10 border border-emerald-200 transition-all flex items-center justify-center shadow-[0_5px_0px_0px_rgba(16,185,129,0.2)] hover:shadow-[0_3px_0px_0px_rgba(16,185,129,0.2)] active:shadow-none active:translate-y-[3px] bg-blue-600 hover:bg-blue-500 text-slate-50 rounded"
      >
        <Phone className="h-5 w-5" />
      </button>
      
      <button 
        onClick={onWhatsApp} 
        className="flex-1 h-10 border border-emerald-200 transition-all flex items-center justify-center shadow-[0_5px_0px_0px_rgba(16,185,129,0.2)] hover:shadow-[0_3px_0px_0px_rgba(16,185,129,0.2)] active:shadow-none active:translate-y-[3px] text-slate-50 rounded bg-green-500 hover:bg-green-400"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
      
      <button 
        onClick={onDirections} 
        className="flex-1 h-10 border border-emerald-200 transition-all flex items-center justify-center shadow-[0_5px_0px_0px_rgba(16,185,129,0.2)] hover:shadow-[0_3px_0px_0px_rgba(16,185,129,0.2)] active:shadow-none active:translate-y-[3px] text-slate-50 rounded bg-gray-700 hover:bg-gray-600"
      >
        <Navigation2 className="h-5 w-5" />
      </button>
      
      <button 
        onClick={onShare} 
        className="flex-1 h-10 border border-emerald-200 transition-all flex items-center justify-center shadow-[0_5px_0px_0px_rgba(16,185,129,0.2)] hover:shadow-[0_3px_0px_0px_rgba(16,185,129,0.2)] active:shadow-none active:translate-y-[3px] text-slate-50 rounded bg-purple-600 hover:bg-purple-500"
      >
        <Share2 className="h-5 w-5" />
      </button>
    </div>
  );
};

export default LocationActionButtons;
