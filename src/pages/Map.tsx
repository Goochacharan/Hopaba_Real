
import React, { useEffect, useState, useRef } from 'react';
import MainLayout from '@/components/MainLayout';
import { useNavigate } from 'react-router-dom';
import LocationSelector from '@/components/LocationSelector';
import { Button } from '@/components/ui/button';
import { MapPin, List } from 'lucide-react';
import useRecommendations from '@/hooks/useRecommendations';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const Map = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>("Bengaluru, Karnataka");
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any | null>(null);
  const markers = useRef<any[]>([]);
  const navigate = useNavigate();

  const { recommendations } = useRecommendations({});

  const handleLocationChange = (location: string, coordinates?: { lat: number; lng: number }) => {
    setSelectedLocation(location);
    if (coordinates) {
      setUserCoordinates(coordinates);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      setLoading(false);
    };
    checkUser();

    // Create a new script element for loading MapMyIndia Maps SDK
    const loadMapScript = async () => {
      try {
        // Get MapMyIndia API key from edge function
        const { data, error } = await supabase.functions.invoke('get-mapmyindia-key');
        if (error) throw error;
        
        const apiKey = data.apiKey;
        
        if (!apiKey) {
          console.error('MapMyIndia API key not found');
          return;
        }
        
        return new Promise<void>((resolve, reject) => {
          // Check if MapmyIndia script is already loaded
          if (window.MapmyIndia) {
            setMapLoaded(true);
            resolve();
            return;
          }
          
          // Load MapmyIndia SDK
          const script = document.createElement('script');
          script.src = `https://apis.mapmyindia.com/advancedmaps/v1/${apiKey}/map_load?v=1.5`;
          script.async = true;
          script.defer = true;
          
          script.onload = () => {
            setMapLoaded(true);
            resolve();
          };
          
          script.onerror = (error) => {
            console.error('Error loading MapMyIndia script:', error);
            reject(error);
          };
          
          document.head.appendChild(script);
        });
      } catch (error) {
        console.error('Failed to load MapMyIndia script:', error);
      }
    };

    loadMapScript();
    
    return () => {
      // Clean up map instance if it exists
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);
  
  // Initialize the map after the script is loaded
  useEffect(() => {
    if (!mapLoaded || !mapContainer.current) return;
    
    const initializeMap = async () => {
      try {
        // Default center (Bengaluru)
        const defaultCenter = [77.5946, 12.9716]; 
        const center = userCoordinates 
          ? [userCoordinates.lng, userCoordinates.lat] 
          : defaultCenter;
        
        // Initialize MapMyIndia map
        map.current = new window.MapmyIndia.Map(mapContainer.current, {
          center: center,
          zoom: 12,
          search: false
        });
        
        // Add markers when map is ready
        map.current.addEventListener('load', () => {
          addMarkers();
        });
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };
    
    const addMarkers = () => {
      // Clear existing markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      
      // Add user location marker if available
      if (userCoordinates) {
        const userMarker = new window.MapmyIndia.Marker({
          position: [userCoordinates.lng, userCoordinates.lat],
          icon: {
            url: 'https://apis.mapmyindia.com/map_v3/1.png',
            width: 25,
            height: 41
          },
          map: map.current,
          draggable: false,
          popupHtml: '<p>Your location</p>'
        });
        
        markers.current.push(userMarker);
      }
      
      // Add recommendation markers
      recommendations.forEach(rec => {
        // Using dummy coordinates for example
        const latitude = parseFloat(rec.id) % 0.1 + 12.9716;
        const longitude = parseFloat(rec.id) % 0.1 + 77.5946;
        
        const marker = new window.MapmyIndia.Marker({
          position: [longitude, latitude],
          map: map.current,
          draggable: false,
          popupHtml: `
            <div>
              <h3>${rec.name}</h3>
              <p>${rec.address}</p>
              <button onclick="window.location.href='/location/${rec.id}'">View Details</button>
            </div>
          `
        });
        
        markers.current.push(marker);
      });
    };
    
    initializeMap();
  }, [mapLoaded, recommendations, userCoordinates]);

  return (
    <MainLayout>
      <section className="py-8 px-4 w-full pb-28">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-3xl font-medium mb-6">Locations Map</h1>
          
          <div className="mb-4">
            <LocationSelector 
              selectedLocation={selectedLocation} 
              onLocationChange={handleLocationChange} 
            />
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="h-[600px] w-full relative" ref={mapContainer}>
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                      <p className="text-muted-foreground">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2"
                >
                  <List className="h-4 w-4" />
                  View as List
                </Button>
                <div className="text-xs text-muted-foreground">
                  Showing {recommendations.length} locations
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Map;
