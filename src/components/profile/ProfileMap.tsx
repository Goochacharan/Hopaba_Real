
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import useUserMarketplaceListings from '@/hooks/useUserMarketplaceListings';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';

// Define types for our location items
interface LocationItem {
  id: string;
  name: string;
  type: 'business' | 'marketplace' | 'event';
  latitude: number;
  longitude: number;
  address: string;
}

const ProfileMap = () => {
  const { user } = useAuth();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationItems, setLocationItems] = useState<LocationItem[]>([]);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any | null>(null);
  const markers = useRef<any[]>([]);
  const { listings } = useUserMarketplaceListings();

  // Load MapMyIndia script
  useEffect(() => {
    const loadMapScript = async () => {
      try {
        // Check if MapmyIndia script is already loaded
        if (window.MapmyIndia) {
          setMapLoaded(true);
          return;
        }
        
        // Get MapMyIndia API key from edge function
        const { data, error } = await supabase.functions.invoke('get-mapmyindia-key');
        if (error) throw error;
        
        const apiKey = data.apiKey;
        
        if (!apiKey) {
          console.error('MapMyIndia API key not found');
          return;
        }
        
        // Load MapmyIndia SDK
        const script = document.createElement('script');
        script.src = `https://apis.mapmyindia.com/advancedmaps/v1/${apiKey}/map_load?v=1.5`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          setMapLoaded(true);
        };
        
        script.onerror = (error) => {
          console.error('Error loading MapMyIndia script:', error);
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.error('Failed to load MapMyIndia script:', error);
      }
    };

    loadMapScript();
  }, []);

  // Fetch user's location data
  useEffect(() => {
    if (!user) return;
    
    const fetchUserBusinesses = async () => {
      try {
        // Fetch businesses
        const { data: businesses, error: businessError } = await supabase
          .from('service_providers')
          .select('id, name, address, city, area')
          .eq('user_id', user.id);
          
        if (businessError) throw businessError;
        
        // Process business locations
        const businessLocations: LocationItem[] = await Promise.all(
          (businesses || []).map(async (business) => {
            // Geocode the address to get coordinates
            const fullAddress = `${business.address}, ${business.area}, ${business.city}`;
            const coordinates = await geocodeAddress(fullAddress);
            
            return {
              id: business.id,
              name: business.name,
              type: 'business',
              latitude: coordinates?.lat || 12.9716, // Fallback to Bengaluru
              longitude: coordinates?.lng || 77.5946,
              address: fullAddress
            };
          })
        );
        
        // Process marketplace listings with locations
        const marketplaceLocations: LocationItem[] = listings
          .filter(listing => listing.location)
          .map(listing => {
            // For this example, we're using dummy coordinates based on the listing ID
            // In a real implementation, you would geocode the location or store actual coordinates
            const latitude = parseFloat(listing.id) % 0.1 + 12.9716;
            const longitude = parseFloat(listing.id) % 0.1 + 77.5946;
            
            return {
              id: listing.id,
              name: listing.title,
              type: 'marketplace',
              latitude,
              longitude,
              address: listing.location || ''
            };
          });
          
        // Combine all location items
        setLocationItems([...businessLocations, ...marketplaceLocations]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching location data:', error);
        setLoading(false);
      }
    };
    
    fetchUserBusinesses();
  }, [user, listings]);
  
  // Initialize map and add markers
  useEffect(() => {
    if (!mapLoaded || !mapContainer.current || loading || locationItems.length === 0) return;
    
    const initializeMap = async () => {
      try {
        // Default center (Bengaluru)
        const defaultCenter: [number, number] = [77.5946, 12.9716]; 
        
        // Use the first location item as the center if available
        const center: [number, number] = locationItems.length > 0
          ? [locationItems[0].longitude, locationItems[0].latitude]
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
      
      // Add location markers
      locationItems.forEach(item => {
        const markerIcon = getMarkerIconByType(item.type);
        
        const marker = new window.MapmyIndia.Marker({
          position: [item.longitude, item.latitude] as [number, number],
          map: map.current,
          draggable: false,
          icon: markerIcon,
          popupHtml: `
            <div>
              <h3 class="font-medium">${item.name}</h3>
              <p class="text-sm">${item.address}</p>
              <div class="mt-1">
                <span class="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                  ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </span>
              </div>
            </div>
          `
        });
        
        markers.current.push(marker);
      });
      
      // Auto-fit bounds if multiple markers
      if (locationItems.length > 1) {
        // This is a simplified version - in a real application you might 
        // want to calculate bounds more precisely
        const bounds = getBounds(locationItems);
        map.current.fitBounds(bounds);
      }
    };
    
    initializeMap();
    
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapLoaded, locationItems, loading]);

  // Helper function to geocode an address
  const geocodeAddress = async (address: string): Promise<{lat: number, lng: number} | null> => {
    try {
      // This is a placeholder. In a real implementation, you would call an actual geocoding service
      // For this example, we'll return dummy coordinates based on the address string
      // In a real app, you would call a geocoding API or store actual coordinates
      if (address.toLowerCase().includes('bengaluru') || address.toLowerCase().includes('bangalore')) {
        return { lat: 12.9716, lng: 77.5946 };
      }
      
      // Generate semi-random coordinates for demo purposes
      const hash = address.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const lat = 12.9716 + (hash % 10) / 100;
      const lng = 77.5946 + (hash % 15) / 100;
      
      return { lat, lng };
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Helper function to get marker icon based on item type
  const getMarkerIconByType = (type: string) => {
    switch (type) {
      case 'business':
        return {
          url: 'https://apis.mapmyindia.com/map_v3/5.png', // Blue marker
          width: 25,
          height: 41
        };
      case 'marketplace':
        return {
          url: 'https://apis.mapmyindia.com/map_v3/2.png', // Red marker
          width: 25,
          height: 41
        };
      case 'event':
        return {
          url: 'https://apis.mapmyindia.com/map_v3/3.png', // Green marker
          width: 25,
          height: 41
        };
      default:
        return undefined; // Default marker
    }
  };

  // Helper function to calculate bounds for a set of locations
  const getBounds = (items: LocationItem[]) => {
    if (items.length === 0) return null;
    
    // Find min/max coordinates
    const coords = items.map(item => ({
      lat: item.latitude,
      lng: item.longitude
    }));
    
    const bounds = coords.reduce(
      (acc, coord) => {
        return {
          minLat: Math.min(acc.minLat, coord.lat),
          maxLat: Math.max(acc.maxLat, coord.lat),
          minLng: Math.min(acc.minLng, coord.lng),
          maxLng: Math.max(acc.maxLng, coord.lng)
        };
      },
      { minLat: 90, maxLat: -90, minLng: 180, maxLng: -180 }
    );
    
    // Return bounds in format expected by MapMyIndia
    return [
      [bounds.minLng, bounds.minLat], // Southwest
      [bounds.maxLng, bounds.maxLat]  // Northeast
    ];
  };

  // Display appropriate content based on loading state
  if (loading) {
    return (
      <Card className="bg-white">
        <CardHeader className="pb-3">
          <CardTitle>Your Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (locationItems.length === 0) {
    return (
      <Card className="bg-white">
        <CardHeader className="pb-3">
          <CardTitle>Your Locations</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Locations Found</h3>
          <p className="text-muted-foreground">
            Add locations to your businesses and marketplace listings to see them on the map.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          Your Locations
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
              Businesses: {locationItems.filter(item => item.type === 'business').length}
            </Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100">
              Marketplace: {locationItems.filter(item => item.type === 'marketplace').length}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] rounded-md overflow-hidden relative">
          <div ref={mapContainer} className="w-full h-full">
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2">
          <div className="text-xs text-muted-foreground">
            Showing {locationItems.length} locations on the map
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileMap;
