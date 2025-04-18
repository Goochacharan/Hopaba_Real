import React, { useEffect, useState, useRef } from 'react';
import MainLayout from '@/components/MainLayout';
import { useNavigate, useLocation } from 'react-router-dom';
import LocationSelector from '@/components/LocationSelector';
import { Button } from '@/components/ui/button';
import { MapPin, List, AlertTriangle } from 'lucide-react';
import useRecommendations from '@/hooks/useRecommendations';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { extractCoordinatesFromMapLink } from '@/lib/locationUtils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface MapProps {
  recommendations: any[];
  userCoordinates: { lat: number; lng: number } | null;
}

const Map: React.FC<MapProps> = ({ recommendations, userCoordinates }) => {
  const [selectedLocation, setSelectedLocation] = useState<string>("Bengaluru, Karnataka");
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any | null>(null);
  const markers = useRef<any[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const mapInitializedRef = useRef(false);

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
        if (error) {
          console.error('Error getting MapMyIndia API key:', error);
          setMapError('Failed to get map API key. Please try again later.');
          setLoading(false);
          return;
        }
        
        const apiKey = data?.apiKey;
        
        if (!apiKey) {
          console.error('MapMyIndia API key not found');
          setMapError('Map API key not found. Please check your configuration.');
          setLoading(false);
          return;
        }
        
        // Check if MapmyIndia script is already loaded
        if (window.MapmyIndia) {
          console.log('MapmyIndia script already loaded');
          setMapLoaded(true);
          setLoading(false);
          return;
        }
          
        // Load MapmyIndia SDK
        const script = document.createElement('script');
        script.src = `https://apis.mapmyindia.com/advancedmaps/v1/${apiKey}/map_load?v=1.5`;
        script.async = true;
        script.defer = true;
          
        script.onload = () => {
          console.log('MapmyIndia script loaded successfully');
          setMapLoaded(true);
          setLoading(false);
        };
          
        script.onerror = (error) => {
          console.error('Error loading MapMyIndia script:', error);
          setMapError('Failed to load map. Please check your internet connection and try again.');
          setLoading(false);
        };
          
        document.head.appendChild(script);
      } catch (error) {
        console.error('Failed to load MapMyIndia script:', error);
        setMapError('Failed to load map. Please try again later.');
        setLoading(false);
      }
    };

    loadMapScript();
    
    return () => {
      // Clean up map instance if it exists
      if (map.current) {
        map.current = null;
      }
      mapInitializedRef.current = false;
    };
  }, []);
  
  // Initialize the map after the script is loaded
  useEffect(() => {
    // Only proceed if all conditions are met:
    // 1. Map script is loaded
    // 2. Map container exists in DOM
    // 3. Recommendations are loaded
    // 4. Map hasn't been initialized yet
    if (!mapLoaded || !mapContainer.current || !recommendations || mapInitializedRef.current) return;

    const initializeMap = () => {
      try {
        console.log('Initializing map with container:', mapContainer.current);
        
        // Default center (Bengaluru)
        const defaultCenter: [number, number] = [77.5946, 12.9716]; 
        const center: [number, number] = userCoordinates 
          ? [userCoordinates.lng, userCoordinates.lat] 
          : defaultCenter;
        
        if (!window.MapmyIndia) {
          console.error('MapmyIndia SDK not loaded');
          setMapError('Map SDK not loaded properly. Please refresh the page.');
          return;
        }

        // Initialize MapMyIndia map
        map.current = new window.MapmyIndia.Map(mapContainer.current, {
          center: center,
          zoom: 12,
          search: false
        });
        
        mapInitializedRef.current = true;
        
        // Add markers when map is ready
        map.current.addEventListener('load', () => {
          console.log('Map loaded, adding markers');
          addMarkers();
        });
        
        toast({
          title: "Map loaded successfully",
          description: "The map has been loaded with your locations.",
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Error initializing map. Please try refreshing the page.');
      }
    };
    
    const addMarkers = () => {
      if (!map.current) return;
      
      // Clear existing markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      
      // Add user location marker if available
      if (userCoordinates) {
        try {
          const userMarker = new window.MapmyIndia.Marker({
            position: [userCoordinates.lng, userCoordinates.lat] as [number, number],
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
        } catch (error) {
          console.error('Error adding user marker:', error);
        }
      }
      
      // Add recommendation markers
      recommendations.forEach(rec => {
        try {
          let lat: number | null = null;
          let lng: number | null = null;
          
          // Try to get coordinates directly from recommendation
          if (rec.latitude && rec.longitude) {
            lat = parseFloat(rec.latitude);
            lng = parseFloat(rec.longitude);
          }
          // Try to extract from map_link if available
          else if (rec.map_link) {
            const coords = extractCoordinatesFromMapLink(rec.map_link);
            if (coords) {
              lat = coords.lat;
              lng = coords.lng;
            }
          }
          
          if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
            const marker = new window.MapmyIndia.Marker({
              position: [lng, lat] as [number, number],
              map: map.current,
              draggable: false,
              popupHtml: `
                <div>
                  <h3>${rec.name}</h3>
                  <p>${rec.address || rec.area}</p>
                  <button onclick="window.location.href='/location/${rec.id}'">View Details</button>
                </div>
              `
            });
            
            markers.current.push(marker);
          } else {
            console.log(`Location ${rec.name} missing valid coordinates`);
          }
        } catch (error) {
          console.error(`Error adding marker for ${rec.name}:`, error);
        }
      });

      // If we have valid coordinates, fit the map to show all markers
      if (markers.current.length > 1) {
        try {
          const bounds = new window.MapmyIndia.LatLngBounds();
          markers.current.forEach(marker => {
            bounds.extend(marker.getPosition());
          });
          map.current.fitBounds(bounds);
        } catch (error) {
          console.error('Error fitting bounds:', error);
        }
      } else if (markers.current.length === 1) {
        // If there's only one marker, center on it
        try {
          const position = markers.current[0].getPosition();
          map.current.setCenter(position);
          map.current.setZoom(14);
        } catch (error) {
          console.error('Error centering on marker:', error);
        }
      }
    };
    
    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      initializeMap();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [mapLoaded, recommendations, userCoordinates, toast]);

  // Update markers when recommendations or user location changes
  useEffect(() => {
    if (map.current && mapInitializedRef.current && recommendations) {
      try {
        // Add markers when recommendations change
        const addMarkers = () => {
          // Clear existing markers
          markers.current.forEach(marker => {
            if (marker && marker.remove) {
              marker.remove();
            }
          });
          markers.current = [];
          
          // Add user location marker if available
          if (userCoordinates) {
            try {
              const userMarker = new window.MapmyIndia.Marker({
                position: [userCoordinates.lng, userCoordinates.lat] as [number, number],
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
            } catch (error) {
              console.error('Error adding user marker:', error);
            }
          }
          
          // Add recommendation markers
          recommendations.forEach(rec => {
            try {
              let lat: number | null = null;
              let lng: number | null = null;
              
              // Try to get coordinates directly from recommendation
              if (rec.latitude && rec.longitude) {
                lat = parseFloat(rec.latitude);
                lng = parseFloat(rec.longitude);
              }
              // Try to extract from map_link if available
              else if (rec.map_link) {
                const coords = extractCoordinatesFromMapLink(rec.map_link);
                if (coords) {
                  lat = coords.lat;
                  lng = coords.lng;
                }
              }
              
              if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
                const marker = new window.MapmyIndia.Marker({
                  position: [lng, lat] as [number, number],
                  map: map.current,
                  draggable: false,
                  popupHtml: `
                    <div>
                      <h3>${rec.name}</h3>
                      <p>${rec.address || rec.area}</p>
                      <button onclick="window.location.href='/location/${rec.id}'">View Details</button>
                    </div>
                  `
                });
                
                markers.current.push(marker);
              } else {
                console.log(`Location ${rec.name} missing valid coordinates`);
              }
            } catch (error) {
              console.error(`Error adding marker for ${rec.name}:`, error);
            }
          });

          // If we have valid coordinates, fit the map to show all markers
          if (markers.current.length > 1) {
            try {
              const bounds = new window.MapmyIndia.LatLngBounds();
              markers.current.forEach(marker => {
                bounds.extend(marker.getPosition());
              });
              map.current.fitBounds(bounds);
            } catch (error) {
              console.error('Error fitting bounds:', error);
            }
          } else if (markers.current.length === 1) {
            // If there's only one marker, center on it
            try {
              const position = markers.current[0].getPosition();
              map.current.setCenter(position);
              map.current.setZoom(14);
            } catch (error) {
              console.error('Error centering on marker:', error);
            }
          }
        };
        
        addMarkers();
      } catch (error) {
        console.error('Error updating markers:', error);
      }
    }
  }, [recommendations, userCoordinates]);

  return (
    <section className="w-full">
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <div 
            className="h-[600px] w-full relative" 
            ref={mapContainer}
            id="map-container"
          >
            {!mapLoaded && !mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading map...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Map;
