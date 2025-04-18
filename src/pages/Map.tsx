
import React, { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGoogleMapsKey } from '@/hooks/useGoogleMapsKey';
import MapError from '@/components/map/MapError';
import MapMarkers from '@/components/map/MapMarkers';

interface MapComponentProps {
  recommendations?: any[];
  userCoordinates: { lat: number; lng: number } | null;
  marketplaceListings?: any[];
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  recommendations = [], 
  userCoordinates: initialUserCoordinates,
  marketplaceListings = []
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [apiKeyFetchAttempts, setApiKeyFetchAttempts] = useState(0);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  const infoWindows = useRef<google.maps.InfoWindow[]>([]);
  const { toast } = useToast();
  const { fetchApiKey, loading: apiKeyLoading, error: apiKeyError } = useGoogleMapsKey();
  
  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainer.current || map.current) return;
      
      try {
        console.log("Starting map initialization process");
        setIsRetrying(true);
        
        const apiKey = await fetchApiKey();
        if (!apiKey) {
          console.error("Failed to get Google Maps API key");
          setMapError(apiKeyError || "Failed to get map API key");
          setIsRetrying(false);
          return;
        }
        
        if (!window.google) {
          console.log("Google Maps not loaded yet, loading script");
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
          script.async = true;
          script.defer = true;
          
          window.initMap = () => {
            console.log("Google Maps script loaded successfully");
            setMapLoaded(true);
            setMapError(null);
            setIsRetrying(false);
          };
          
          script.onerror = (error) => {
            console.error("Error loading Google Maps script:", error);
            setMapError('Failed to load Google Maps. Please check your internet connection.');
            setIsRetrying(false);
          };
          
          document.head.appendChild(script);
        } else {
          console.log("Google Maps already loaded");
          setMapLoaded(true);
          setMapError(null);
          setIsRetrying(false);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Error initializing map. Please try refreshing the page.');
        setIsRetrying(false);
      }
    };
    
    initializeMap();
    
    return () => {
      markers.current.forEach(marker => marker.setMap(null));
      infoWindows.current.forEach(infoWindow => infoWindow.close());
      map.current = null;
      
      // Clean up the global callback
      if (window.initMap) {
        delete window.initMap;
      }
    };
  }, [apiKeyFetchAttempts]);
  
  useEffect(() => {
    if (!mapLoaded || !mapContainer.current || map.current) return;
    
    try {
      console.log("Creating Google Map instance");
      const center = initialUserCoordinates || { lat: 12.9716, lng: 77.5946 }; // Default to Bangalore
      
      map.current = new window.google.maps.Map(mapContainer.current, {
        center,
        zoom: 12,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true
      });
      
      toast({
        title: "Map loaded successfully",
        description: "The map has been loaded with your locations.",
      });
    } catch (error) {
      console.error('Error creating map:', error);
      setMapError('Error creating map. Please try refreshing the page.');
    }
  }, [mapLoaded, initialUserCoordinates, toast]);

  const handleRetryMapLoad = () => {
    console.log("Retrying map load");
    setMapError(null);
    setIsRetrying(true);
    setApiKeyFetchAttempts(prev => prev + 1);
    toast({
      title: "Retrying...",
      description: "Attempting to reload the map",
    });
  };

  // Early return if there's an error
  if (mapError) {
    return (
      <MapError 
        error={mapError}
        onRetry={handleRetryMapLoad}
        isRetrying={isRetrying}
      />
    );
  }

  return (
    <section className="w-full">
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <div 
            className="h-[600px] w-full relative" 
            ref={mapContainer}
            id="map-container"
          >
            {(!mapLoaded || apiKeyLoading || isRetrying) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    {isRetrying ? "Retrying map load..." : "Loading map..."}
                  </p>
                </div>
              </div>
            )}
            
            {map.current && mapLoaded && (
              <MapMarkers
                map={map.current}
                recommendations={recommendations}
                marketplaceListings={marketplaceListings}
                userCoordinates={initialUserCoordinates}
                markers={markers}
                infoWindows={infoWindows}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapComponent;
