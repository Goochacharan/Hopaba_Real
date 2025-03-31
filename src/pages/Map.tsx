import React, { useEffect, useState, useRef } from 'react';
import MainLayout from '@/components/MainLayout';
import { useNavigate } from 'react-router-dom';
import LocationSelector from '@/components/LocationSelector';
import { Button } from '@/components/ui/button';
import { MapPin, List } from 'lucide-react';
import { useRecommendations } from "@/hooks/useRecommendations";
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';

const Map = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>("Bengaluru, Karnataka");
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
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

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      setLoading(false);
    };
    checkUser();

    setMapLoaded(true);
  }, [navigate]);

  useEffect(() => {
    if (!mapLoaded || !mapContainer.current) return;

    const initializeMap = () => {
      try {
        mapboxgl.accessToken = 'pk.YOUR_MAPBOX_TOKEN';
        
        const defaultCenter: [number, number] = [77.5946, 12.9716];
        const center: [number, number] = userCoordinates ? [userCoordinates.lng, userCoordinates.lat] : defaultCenter;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: center,
          zoom: 12
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        map.current.on('load', () => {
          addMarkers();
        });
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    const addMarkers = () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      
      if (userCoordinates) {
        const userMarker = new mapboxgl.Marker({ color: '#FF0000' })
          .setLngLat([userCoordinates.lng, userCoordinates.lat])
          .setPopup(new mapboxgl.Popup().setHTML('<p>Your location</p>'))
          .addTo(map.current!);
        markers.current.push(userMarker);
      }
      
      recommendations.forEach(rec => {
        const latitude = parseFloat(rec.id) % 0.1 + 12.9716;
        const longitude = parseFloat(rec.id) % 0.1 + 77.5946;
        
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
          .addTo(map.current!);
        markers.current.push(marker);
      });
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
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
