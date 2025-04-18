
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { extractCoordinatesFromMapLink } from '@/lib/locationUtils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useMarketplaceListings } from '@/hooks/useMarketplaceListings';
import { Button } from '@/components/ui/button';

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
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'all';
  
  const [selectedLocation, setSelectedLocation] = useState<string>("Bengaluru, Karnataka");
  const [localUserCoordinates, setLocalUserCoordinates] = useState<{ lat: number; lng: number } | null>(initialUserCoordinates);
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
  
  // If we're in a marketplace context, fetch listings
  const { listings: fetchedListings, loading: listingsLoading } = useLocation().pathname.includes('marketplace') 
    ? useMarketplaceListings({
        searchQuery: searchQuery,
        category: categoryParam !== 'all' ? categoryParam : undefined
      })
    : { listings: [], loading: false };
  
  // Combine props marketplaceListings with fetched listings
  const allMarketplaceListings = [...marketplaceListings, ...fetchedListings];
  
  const handleLocationChange = (location: string, coordinates?: { lat: number; lng: number }) => {
    setSelectedLocation(location);
    if (coordinates) {
      setLocalUserCoordinates(coordinates);
    }
  };

  useEffect(() => {
    setLocalUserCoordinates(initialUserCoordinates);
  }, [initialUserCoordinates]);

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      setLoading(false);
    };
    checkUser();

    const loadMapScript = async () => {
      try {
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
        
        if (window.MapmyIndia) {
          console.log('MapmyIndia script already loaded');
          setMapLoaded(true);
          setLoading(false);
          return;
        }
          
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
      if (map.current) {
        map.current = null;
      }
      mapInitializedRef.current = false;
    };
  }, []);
  
  // Define the addMarkers function at the module level
  const addMarkers = () => {
    if (!map.current || !mapInitializedRef.current) return;
    
    try {
      // Clear existing markers
      markers.current.forEach(marker => {
        if (marker && marker.remove) {
          marker.remove();
        }
      });
      markers.current = [];
      
      // Add user location marker
      if (localUserCoordinates) {
        try {
          const userMarker = new window.MapmyIndia.Marker({
            position: [localUserCoordinates.lng, localUserCoordinates.lat] as [number, number],
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
          
          if (rec.latitude && rec.longitude) {
            lat = parseFloat(rec.latitude);
            lng = parseFloat(rec.longitude);
          }
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
                  <p>${rec.address || rec.area || ''}</p>
                  <button onclick="window.location.href='/location/${rec.id}'">View Details</button>
                </div>
              `
            });
            
            markers.current.push(marker);
          } else {
            console.log(`Service provider ${rec.name} missing valid coordinates`);
          }
        } catch (error) {
          console.error(`Error adding marker for ${rec.name}:`, error);
        }
      });
      
      // Add marketplace listing markers
      console.log('Adding marketplace listing markers:', allMarketplaceListings.length);
      allMarketplaceListings.forEach(listing => {
        try {
          let lat: number | null = null;
          let lng: number | null = null;
          
          if (listing.latitude && listing.longitude) {
            lat = parseFloat(listing.latitude);
            lng = parseFloat(listing.longitude);
            console.log(`Listing ${listing.title} has coordinates:`, lat, lng);
          }
          else if (listing.map_link) {
            const coords = extractCoordinatesFromMapLink(listing.map_link);
            if (coords) {
              lat = coords.lat;
              lng = coords.lng;
              console.log(`Extracted coordinates for ${listing.title}:`, lat, lng);
            }
          }
          
          if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
            const marker = new window.MapmyIndia.Marker({
              position: [lng, lat] as [number, number],
              map: map.current,
              draggable: false,
              popupHtml: `
                <div>
                  <h3>${listing.title}</h3>
                  <p>${listing.price ? '₹' + listing.price : ''}</p>
                  <p>${listing.location || ''}</p>
                  <button onclick="window.location.href='/marketplace/${listing.id}'">View Details</button>
                </div>
              `
            });
            
            markers.current.push(marker);
          } else {
            console.log(`Marketplace listing ${listing.title} missing valid coordinates`);
          }
        } catch (error) {
          console.error(`Error adding marker for listing ${listing.title}:`, error);
        }
      });

      // Fit bounds if we have markers
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
        try {
          const position = markers.current[0].getPosition();
          map.current.setCenter(position);
          map.current.setZoom(14);
        } catch (error) {
          console.error('Error centering on marker:', error);
        }
      }
    } catch (error) {
      console.error('Error in addMarkers function:', error);
    }
  };
  
  useEffect(() => {
    if (!mapLoaded || !mapContainer.current || mapInitializedRef.current) return;

    const initializeMap = () => {
      try {
        console.log('Initializing map with container:', mapContainer.current);
        
        const defaultCenter: [number, number] = [77.5946, 12.9716]; 
        const center: [number, number] = localUserCoordinates 
          ? [localUserCoordinates.lng, localUserCoordinates.lat] 
          : defaultCenter;
        
        if (!window.MapmyIndia) {
          console.error('MapmyIndia SDK not loaded');
          setMapError('Map SDK not loaded properly. Please refresh the page.');
          return;
        }

        map.current = new window.MapmyIndia.Map(mapContainer.current, {
          center: center,
          zoom: 12,
          search: false
        });
        
        mapInitializedRef.current = true;
        
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
    
    const timer = setTimeout(() => {
      initializeMap();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [mapLoaded, localUserCoordinates, toast]);

  // Update markers when recommendations or marketplace listings change
  useEffect(() => {
    if (map.current && mapInitializedRef.current) {
      addMarkers();
    }
  }, [recommendations, allMarketplaceListings, localUserCoordinates]);

  if (mapError) {
    return (
      <section className="w-full">
        <div className="max-w-[1400px] mx-auto">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Map Error</AlertTitle>
            <AlertDescription>{mapError}</AlertDescription>
          </Alert>
          
          <div className="mt-4">
            <Button onClick={() => window.location.reload()}>
              Reload
            </Button>
          </div>
        </div>
      </section>
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
            {(!mapLoaded || loading || listingsLoading) && (
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

export default MapComponent;
