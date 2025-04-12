
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CircleCheck } from 'lucide-react';
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CertificateBadgeProps {
  certificates: string[];
}

const CertificateBadge: React.FC<CertificateBadgeProps> = ({ certificates }) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedCertificateIndex, setSelectedCertificateIndex] = React.useState(0);
  
  if (!certificates || certificates.length === 0) {
    return null;
  }

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Badge 
            variant="success" 
            className="flex items-center gap-1 cursor-pointer hover:bg-green-200"
          >
            <CircleCheck className="h-3 w-3 text-green-700" />
            <span>Inspection report</span>
          </Badge>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="text-sm font-medium">
            This item has {certificates.length > 1 ? `${certificates.length} inspection reports` : 'an inspection report'}.
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            The seller has provided third-party inspection documents to verify the condition of this item.
          </p>
          <Button 
            size="sm" 
            className="w-full mt-3"
            onClick={() => setIsDialogOpen(true)}
          >
            View Report{certificates.length > 1 ? 's' : ''}
          </Button>
        </PopoverContent>
      </Popover>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Inspection Report
              {certificates.length > 1 && ` (${selectedCertificateIndex + 1}/${certificates.length})`}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh]">
            <div className="flex flex-col items-center">
              <img 
                src={certificates[selectedCertificateIndex]} 
                alt={`Inspection Report ${selectedCertificateIndex + 1}`}
                className="max-w-full rounded-md"
              />
            </div>
          </ScrollArea>
          
          {certificates.length > 1 && (
            <div className="flex justify-between mt-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedCertificateIndex((prev) => 
                  prev === 0 ? certificates.length - 1 : prev - 1
                )}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedCertificateIndex((prev) => 
                  (prev + 1) % certificates.length
                )}
              >
                Next
              </Button>
            </div>
          )}
          
          <div className="flex justify-end mt-2">
            <a 
              href={certificates[selectedCertificateIndex]} 
              target="_blank" 
              rel="noopener noreferrer" 
              download={`inspection-report-${selectedCertificateIndex + 1}.jpg`}
            >
              <Button variant="outline" size="sm">
                Download
              </Button>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CertificateBadge;
