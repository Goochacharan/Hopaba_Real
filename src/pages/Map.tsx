
import React, { useEffect, useState, useRef } from 'react';
import MainLayout from '@/components/MainLayout';
import { useNavigate } from 'react-router-dom';
import LocationSelector from '@/components/LocationSelector';
import { Button } from '@/components/ui/button';
import { MapPin, List } from 'lucide-react';
import useRecommendations from '@/hooks/useRecommendations';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

const Map = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>("Bengaluru, Karnataka");
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenEntered, setTokenEntered] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const navigate = useNavigate();

  const { recommendations } = useRecommendations({});

  const handleLocationChange = (location: string, coordinates?: { lat: number; lng: number }) => {
    setSelectedLocation(location);
    if (coordinates) {
      setUserCoordinates(coordinates);
    }
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim().length < 20) {
      toast({
        title: "Invalid Token",
        description: "Please enter a valid Mapbox access token",
        variant: "destructive"
      });
      return;
    }
    localStorage.setItem('mapbox_token', mapboxToken);
    setTokenEntered(true);
    initializeMap();
  };

  // Load the Mapbox script
  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      setLoading(false);
    };
    checkUser();

    // Check for token in localStorage
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setMapboxToken(savedToken);
      setTokenEntered(true);
    }

    // Set mapLoaded to true since we're now importing mapboxgl directly
    setMapLoaded(true);
  }, [navigate]);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken || !tokenEntered) return;

    try {
      // Clean up previous map instance if it exists
      if (map.current) {
        map.current.remove();
      }

      // Initialize map with the token
      mapboxgl.accessToken = mapboxToken;
      
      // Initialize map centered at Bengaluru or user coordinates
      const defaultCenter: [number, number] = [77.5946, 12.9716]; // Bengaluru coordinates
      const center: [number, number] = userCoordinates ? [userCoordinates.lng, userCoordinates.lat] : defaultCenter;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: center,
        zoom: 12
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      map.current.on('load', () => {
        // Add markers for all recommendations
        addMarkers();
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        title: "Map Error",
        description: "There was an error initializing the map. Please check your token.",
        variant: "destructive"
      });
    }
  };

  const addMarkers = () => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    
    // Add user location marker if available
    if (userCoordinates) {
      const userMarker = new mapboxgl.Marker({ color: '#FF0000' })
        .setLngLat([userCoordinates.lng, userCoordinates.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<p>Your location</p>'))
        .addTo(map.current);
      markers.current.push(userMarker);
    }
    
    // Add recommendation markers
    recommendations.forEach(rec => {
      // This is a simplified example, in a real app you'd need actual coordinates
      // Either from the recommendation object or from geocoding the address
      const latitude = parseFloat(rec.id) % 0.1 + 12.9716; // Dummy coordinates for example
      const longitude = parseFloat(rec.id) % 0.1 + 77.5946; // Dummy coordinates for example
      
      const marker = new mapboxgl.Marker({ color: '#3FB1CE' })
        .setLngLat([longitude, latitude])
        .setPopup(
          new mapboxgl.Popup().setHTML(
            `<div>
              <h3>${rec.name}</h3>
              <p>${rec.address}</p>
              <button onclick="window.location.href='/location/${rec.id}'">View Details</button>
            </div>`
          )
        )
        .addTo(map.current);
      markers.current.push(marker);
    });
  };

  // Initialize or update the map when coordinates or token change
  useEffect(() => {
    if (tokenEntered) {
      initializeMap();
    }
  }, [userCoordinates, tokenEntered, recommendations]);

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
              {!tokenEntered ? (
                <div className="p-8">
                  <div className="mb-4 text-center">
                    <h2 className="text-xl font-semibold mb-2">Enter Mapbox Access Token</h2>
                    <p className="text-muted-foreground mb-6">
                      To use the map feature, you need to provide a Mapbox access token.
                      Get your free token at <a href="https://mapbox.com/account/access-tokens" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>.
                    </p>
                    <form onSubmit={handleTokenSubmit} className="max-w-md mx-auto">
                      <div className="flex gap-2">
                        <Input 
                          value={mapboxToken}
                          onChange={(e) => setMapboxToken(e.target.value)}
                          placeholder="Enter your Mapbox access token"
                          className="flex-1"
                          type="password"
                        />
                        <Button type="submit">Apply</Button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Map;
