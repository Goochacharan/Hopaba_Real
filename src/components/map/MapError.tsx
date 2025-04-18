
import React from 'react';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface MapErrorProps {
  error: string;
  onRetry: () => void;
  isRetrying: boolean;
}

const MapError: React.FC<MapErrorProps> = ({ error, onRetry, isRetrying }) => {
  return (
    <section className="w-full">
      <div className="max-w-[1400px] mx-auto">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Map Error</AlertTitle>
          <AlertDescription className="whitespace-pre-line">
            {error}
            <br />
            Please try reloading the map or check your connection.
          </AlertDescription>
        </Alert>
        
        <div className="mt-4">
          <Button 
            onClick={onRetry}
            disabled={isRetrying}
            className="flex items-center gap-2"
          >
            {isRetrying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Reload Map
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MapError;
