
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Download, ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CertificateViewerProps {
  certificates: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CertificateViewer = ({ certificates, open, onOpenChange }: CertificateViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!certificates || certificates.length === 0) {
    return null;
  }

  const currentCertificate = certificates[currentIndex];
  const isImage = currentCertificate?.match(/\.(jpeg|jpg|gif|png|webp)$/i);
  const isPdf = currentCertificate?.match(/\.(pdf)$/i);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : certificates.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < certificates.length - 1 ? prev + 1 : 0));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Inspection Certificate {currentIndex + 1} of {certificates.length}</span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(currentCertificate, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Open
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(currentCertificate, '_blank')}
                asChild
              >
                <a href={currentCertificate} download target="_blank" rel="noreferrer">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </a>
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden bg-black/5 rounded-lg flex flex-col items-center justify-center relative">
          {isImage ? (
            <img 
              src={currentCertificate} 
              alt={`Inspection certificate ${currentIndex + 1}`} 
              className="max-h-full max-w-full object-contain"
            />
          ) : isPdf ? (
            <iframe 
              src={`${currentCertificate}#toolbar=0`} 
              className="w-full h-full" 
              title={`Inspection certificate ${currentIndex + 1}`}
            />
          ) : (
            <div className="text-center p-6 flex flex-col items-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                This certificate format cannot be previewed.
              </p>
              <Button 
                className="mt-4" 
                onClick={() => window.open(currentCertificate, '_blank')}
              >
                Open Certificate
              </Button>
            </div>
          )}

          {certificates.length > 1 && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
        
        <div className="flex justify-center gap-1 pt-2">
          {certificates.map((_, idx) => (
            <Button 
              key={idx} 
              variant="ghost" 
              size="sm" 
              className={`w-6 h-6 p-0 ${idx === currentIndex ? 'bg-primary text-primary-foreground' : ''}`}
              onClick={() => setCurrentIndex(idx)}
            >
              {idx + 1}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CertificateViewer;
