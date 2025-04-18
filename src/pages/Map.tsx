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
  
  const { listings: fetchedListings, loading: listingsLoading } = useLocation().pathname.includes('marketplace') 
    ? useMarketplaceListings({
        searchQuery: searchQuery,
        category: categoryParam !== 'all' ? categoryParam : undefined
      })
    : { listings: [], loading: false };
  
  const allMarketplaceListings = [...marketplaceListings, ...fetchedListings];

  // Added specific function to fetch approved service providers 
  const fetchServiceProviders = async () => {
    try {
      console.log('Fetching service providers for map display');
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('approval_status', 'approved');
      
      if (error) {
        console.error('Error fetching service providers:', error);
        return [];
      }
      
      console.log(`Fetched ${data.length} service providers from Supabase`);
      return data || [];
    } catch (error) {
      console.error('Error in fetchServiceProviders:', error);
      return [];
    }
  };

  const [serviceProviders, setServiceProviders] = useState<any[]>([]);
  const [serviceProvidersLoading, setServiceProvidersLoading] = useState(false);
  
  useEffect(() => {
    const loadServiceProviders = async () => {
      setServiceProvidersLoading(true);
      console.log('Loading service providers for map...');
      const providers = await fetchServiceProviders();
      console.log(`Loaded ${providers.length} service providers for map`);
      setServiceProviders(providers);
      setServiceProvidersLoading(false);
    };
    
    loadServiceProviders();
  }, []);

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
        // Fetch MapMyIndia API key from Supabase Edge Function
        console.log('Fetching MapMyIndia API key...');
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
        
        // Check if MapmyIndia is already loaded
        if (window.MapmyIndia) {
          console.log('MapmyIndia script already loaded');
          setMapLoaded(true);
          setLoading(false);
          return;
        }
          
        // If not, load the MapMyIndia script
        console.log('Loading MapMyIndia script...');
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
  
  const addMarkers = () => {
    if (!map.current || !mapInitializedRef.current) return;
    
    try {
      console.log("Starting to add markers to map");
      
      // Clear existing markers
      markers.current.forEach(marker => {
        if (marker && marker.remove) {
          marker.remove();
        }
      });
      markers.current = [];
      
      // Add user location marker if available
      if (localUserCoordinates) {
        try {
          console.log("Adding user location marker at:", localUserCoordinates);
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
      
      // Combine recommendations and service providers into one array
      const allRecommendations = [...recommendations, ...serviceProviders];
      console.log(`Total markers to add: ${allRecommendations.length} service providers/recommendations + ${allMarketplaceListings.length} marketplace listings`);
      
      // Add service provider and recommendation markers
      if (allRecommendations && allRecommendations.length > 0) {
        console.log('Adding service provider markers:', allRecommendations.length);
        allRecommendations.forEach((rec, index) => {
          try {
            let lat: number | null = null;
            let lng: number | null = null;
            
            // Get coordinates from explicit lat/lng fields if available
            if (rec.latitude && rec.longitude) {
              lat = parseFloat(rec.latitude);
              lng = parseFloat(rec.longitude);
              console.log(`Service provider ${rec.name} (${index}) has explicit coordinates:`, lat, lng);
            }
            // Otherwise try to extract from map_link
            else if (rec.map_link) {
              console.log(`Service provider ${rec.name} (${index}) has map_link:`, rec.map_link);
              const coords = extractCoordinatesFromMapLink(rec.map_link);
              if (coords) {
                lat = coords.lat;
                lng = coords.lng;
                console.log(`Extracted coordinates for ${rec.name} from map_link:`, lat, lng);
              } else {
                console.log(`Failed to extract coordinates for ${rec.name} from map_link`);
              }
            }
            
            if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
              console.log(`Adding marker for service provider ${rec.name} at coordinates:`, lat, lng);
              
              // Create popup content with business details
              const popupContent = `
                <div style="max-width: 250px; padding: 8px;">
                  <h3 style="margin-top: 0; font-weight: bold;">${rec.name}</h3>
                  <p style="margin: 5px 0;">${rec.address || rec.area || ''}</p>
                  ${rec.category ? `<p style="margin: 5px 0; font-style: italic;">${rec.category}</p>` : ''}
                  <button 
                    style="background: #4f46e5; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 5px;"
                    onclick="window.location.href='/location/${rec.id}'"
                  >
                    View Details
                  </button>
                </div>
              `;
              
              // Create and add the marker
              const marker = new window.MapmyIndia.Marker({
                position: [lng, lat] as [number, number],
                map: map.current,
                draggable: false,
                popupHtml: popupContent
              });
              
              markers.current.push(marker);
            } else {
              console.log(`Service provider ${rec.name} (${index}) missing valid coordinates`);
            }
          } catch (error) {
            console.error(`Error adding marker for ${rec.name}:`, error);
          }
        });
      } else {
        console.log('No service providers to add to map');
      }
      
      // Add marketplace listing markers
      if (allMarketplaceListings && allMarketplaceListings.length > 0) {
        console.log('Adding marketplace listing markers:', allMarketplaceListings.length);
        allMarketplaceListings.forEach((listing, index) => {
          try {
            let lat: number | null = null;
            let lng: number | null = null;
            
            // Get coordinates from explicit lat/lng fields if available
            if (listing.latitude && listing.longitude) {
              lat = parseFloat(listing.latitude);
              lng = parseFloat(listing.longitude);
              console.log(`Marketplace listing ${listing.title} (${index}) has coordinates:`, lat, lng);
            }
            // Otherwise try to extract from map_link
            else if (listing.map_link) {
              console.log(`Marketplace listing ${listing.title} (${index}) has map_link:`, listing.map_link);
              const coords = extractCoordinatesFromMapLink(listing.map_link);
              if (coords) {
                lat = coords.lat;
                lng = coords.lng;
                console.log(`Extracted coordinates for marketplace listing ${listing.title}:`, lat, lng);
              }
            }
            
            if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
              // Add marketplace listing marker
              const marker = new window.MapmyIndia.Marker({
                position: [lng, lat] as [number, number],
                map: map.current,
                draggable: false,
                popupHtml: `
                  <div style="max-width: 250px; padding: 8px;">
                    <h3 style="margin-top: 0; font-weight: bold;">${listing.title}</h3>
                    <p style="margin: 5px 0;">${listing.price ? '₹' + listing.price : ''}</p>
                    <p style="margin: 5px 0;">${listing.location || ''}</p>
                    <button 
                      style="background: #4f46e5; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 5px;"
                      onclick="window.location.href='/marketplace/${listing.id}'"
                    >
                      View Details
                    </button>
                  </div>
                `
              });
              
              markers.current.push(marker);
              console.log(`Successfully added marker for marketplace listing ${listing.title}`);
            } else {
              console.log(`Marketplace listing ${listing.title} (${index}) missing valid coordinates`);
            }
          } catch (error) {
            console.error(`Error adding marker for marketplace listing ${listing.title}:`, error);
          }
        });
      }

      // Adjust map view to show all markers
      if (markers.current.length > 1) {
        try {
          console.log("Fitting bounds to show all markers:", markers.current.length);
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
          console.log("Centering map on single marker");
          const position = markers.current[0].getPosition();
          map.current.setCenter(position);
          map.current.setZoom(14);
        } catch (error) {
          console.error('Error centering on marker:', error);
        }
      } else {
        console.log("No markers to display, showing default view");
        map.current.setCenter([77.5946, 12.9716]); // Bengaluru
        map.current.setZoom(12);
      }
    } catch (error) {
      console.error('Error in addMarkers function:', error);
    }
  };
  
  // Initialize map when MapMyIndia is loaded
  useEffect(() => {
    if (!mapLoaded || !mapContainer.current || mapInitializedRef.current) return;

    const initializeMap = () => {
      try {
        console.log('Initializing map with container:', mapContainer.current);
        
        const defaultCenter: [number, number] = [77.5946, 12.9716]; // Bengaluru 
        const center: [number, number] = localUserCoordinates 
          ? [localUserCoordinates.lng, localUserCoordinates.lat] 
          : defaultCenter;
        
        if (!window.MapmyIndia) {
          console.error('MapmyIndia SDK not loaded');
          setMapError('Map SDK not loaded properly. Please refresh the page.');
          return;
        }

        // Create the map instance
        map.current = new window.MapmyIndia.Map(mapContainer.current, {
          center: center,
          zoom: 12,
          search: false
        });
        
        mapInitializedRef.current = true;
        
        // Add markers when map is loaded
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
    
    // Initialize map with a slight delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeMap();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [mapLoaded, localUserCoordinates, toast]);

  // Update markers when data changes
  useEffect(() => {
    if (map.current && mapInitializedRef.current) {
      console.log('Data changed, updating markers');
      console.log('Number of service providers from search:', recommendations.length);
      console.log('Number of marketplace listings:', allMarketplaceListings.length);
      console.log('Number of service providers from DB:', serviceProviders.length);
      addMarkers();
    }
  }, [recommendations, allMarketplaceListings, serviceProviders, localUserCoordinates]);

  // Show error state if map fails to load
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

  // Render map container with loading state
  return (
    <section className="w-full">
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <div 
            className="h-[600px] w-full relative" 
            ref={mapContainer}
            id="map-container"
          >
            {(!mapLoaded || loading || listingsLoading || serviceProvidersLoading) && (
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
