
import React, { useEffect, useState, useRef } from 'react';
import MainLayout from '@/components/MainLayout';
import { useNavigate } from 'react-router-dom';
import LocationSelector from '@/components/LocationSelector';
import { Button } from '@/components/ui/button';
import { MapPin, List } from 'lucide-react';
import useRecommendations from '@/hooks/useRecommendations';
import { useMarketplaceListings } from '@/hooks/useMarketplaceListings';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { extractCoordinatesFromMapLink } from '@/lib/locationUtils';

const Map = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>("Bengaluru, Karnataka");
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const navigate = useNavigate();

  // Fetch both recommendations and marketplace listings
  const { recommendations } = useRecommendations({});
  const { data: marketplaceListings } = useMarketplaceListings({});

  const handleLocationChange = (location: string, coordinates?: { lat: number; lng: number }) => {
    setSelectedLocation(location);
    if (coordinates) {
      setUserCoordinates(coordinates);
      console.log("User coordinates set from location selector:", coordinates);
    }
  };

  // Load the Mapbox script
  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      setLoading(false);
    };
    checkUser();

    // Set mapLoaded to true since we're now importing mapboxgl directly
    setMapLoaded(true);
  }, [navigate]);

  useEffect(() => {
    if (!mapLoaded || !mapContainer.current) return;

    const initializeMap = () => {
      try {
        // Use the Google Maps API key from Supabase Edge Function secrets
        // For testing now, use a placeholder - you would get this from Supabase Edge Function secrets in production
        // IMPORTANT: In a real production app, load this from Supabase secrets
        mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZXVzZXJzaWRlIiwiYSI6ImNsZ3p2MDBpdzA5aDUzZm1udXR2NGQ2Z3MifQ.g9_N6QV1kYYNjtAQFbirhQ';
        
        // Initialize map centered at Bengaluru or user location if available
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
          // Add markers for all listings
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
        const userMarker = new mapboxgl.Marker({ color: '#FF0000' })
          .setLngLat([userCoordinates.lng, userCoordinates.lat])
          .setPopup(new mapboxgl.Popup().setHTML('<p>Your location</p>'))
          .addTo(map.current!);
        markers.current.push(userMarker);
      }
      
      // Add recommendation markers
      recommendations.forEach(rec => {
        // Try to extract coordinates from map_link if available
        let coordinates = null;
        if (rec.map_link) {
          coordinates = extractCoordinatesFromMapLink(rec.map_link);
        }
        
        // If coordinates extraction failed, use dummy coordinates (would be better with geocoding)
        if (!coordinates) {
          const dummyLat = parseFloat(rec.id) % 0.1 + 12.9716;
          const dummyLng = parseFloat(rec.id) % 0.1 + 77.5946;
          coordinates = { lat: dummyLat, lng: dummyLng };
        }
        
        const marker = new mapboxgl.Marker({ color: '#3FB1CE' })
          .setLngLat([coordinates.lng, coordinates.lat])
          .setPopup(
            new mapboxgl.Popup().setHTML(
              `<div class="p-2">
                <h3 class="font-bold text-sm">${rec.name}</h3>
                <p class="text-xs text-gray-600">${rec.address || ''}</p>
                <a href="/location/${rec.id}" class="text-xs text-blue-600 mt-1 block">View Details</a>
              </div>`
            )
          )
          .addTo(map.current!);
        markers.current.push(marker);
      });
      
      // Add marketplace listing markers
      if (marketplaceListings && marketplaceListings.length > 0) {
        marketplaceListings.forEach(listing => {
          // Try to extract coordinates from map_link
          let coordinates = null;
          
          // First check if we have direct latitude/longitude saved
          if (listing.latitude && listing.longitude) {
            coordinates = { lat: Number(listing.latitude), lng: Number(listing.longitude) };
            console.log(`Using direct coordinates for listing ${listing.id}:`, coordinates);
          } 
          // Then try to extract from map_link
          else if (listing.map_link) {
            coordinates = extractCoordinatesFromMapLink(listing.map_link);
            console.log(`Extracted coordinates for listing ${listing.id}:`, coordinates);
          }
          
          // If coordinates available, add marker
          if (coordinates) {
            const marker = new mapboxgl.Marker({ color: '#F59E0B' }) // Amber color for marketplace listings
              .setLngLat([coordinates.lng, coordinates.lat])
              .setPopup(
                new mapboxgl.Popup().setHTML(
                  `<div class="p-2">
                    <h3 class="font-bold text-sm">${listing.title}</h3>
                    <p class="text-xs text-gray-600">₹${listing.price}</p>
                    <p class="text-xs text-gray-600">${listing.location || ''}</p>
                    <a href="/marketplace/${listing.id}" class="text-xs text-blue-600 mt-1 block">View Details</a>
                  </div>`
                )
              )
              .addTo(map.current!);
            markers.current.push(marker);
          }
        });
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapLoaded, recommendations, marketplaceListings, userCoordinates]);

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
                  Showing {recommendations.length + (marketplaceListings?.length || 0)} locations
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
