
import React, { useEffect, useState, useRef } from 'react';
import MainLayout from '@/components/MainLayout';
import { useNavigate } from 'react-router-dom';
import LocationSelector from '@/components/LocationSelector';
import { Button } from '@/components/ui/button';
import { MapPin, List, AlertCircle } from 'lucide-react';
import useRecommendations from '@/hooks/useRecommendations';
import { useMarketplaceListings } from '@/hooks/useMarketplaceListings';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { extractCoordinatesFromMapLink } from '@/lib/locationUtils';
import { loadGoogleMapsApi } from '@/lib/googleMaps';

const Map = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>("Bengaluru, Karnataka");
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const navigate = useNavigate();

  // Fetch both recommendations and marketplace listings
  const { recommendations } = useRecommendations({});
  const { data: marketplaceListings } = useMarketplaceListings({});

  const handleLocationChange = (location: string, coordinates?: { lat: number; lng: number }) => {
    setSelectedLocation(location);
    if (coordinates) {
      setUserCoordinates(coordinates);
      console.log("User coordinates set from location selector:", coordinates);
      
      // If map is already loaded, center it at the new coordinates
      if (googleMapRef.current && coordinates) {
        googleMapRef.current.setCenter({ lat: coordinates.lat, lng: coordinates.lng });
        googleMapRef.current.setZoom(14);
      }
    }
  };

  // Load Google Maps
  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      setLoading(false);
    };
    checkUser();

    // Load Google Maps API using the utility function
    loadGoogleMapsApi()
      .then(() => {
        console.log('Google Maps API loaded successfully in Map component');
        setMapLoaded(true);
        setMapError(null);
      })
      .catch((error) => {
        console.error('Error loading Google Maps API:', error);
        setMapError(error.message || 'Failed to load Google Maps');
        setMapLoaded(false);
      });
    
    return () => {
      // Clean up markers when component unmounts
      if (markersRef.current.length > 0) {
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
      }
    };
  }, [navigate]);

  useEffect(() => {
    if (!mapLoaded || !mapContainer.current || !window.google || !window.google.maps) return;

    const initializeMap = () => {
      try {
        // Default center is Bengaluru
        const defaultCenter = { lat: 12.9716, lng: 77.5946 };
        const center = userCoordinates || defaultCenter;
        
        // Initialize the map
        googleMapRef.current = new window.google.maps.Map(mapContainer.current, {
          center: center,
          zoom: 12,
          mapTypeControl: true,
          fullscreenControl: true,
          streetViewControl: true,
        });

        // Add markers after map is loaded
        googleMapRef.current.addListener('tilesloaded', () => {
          addMarkers();
        });
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    const addMarkers = () => {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      
      // Add user location marker if available
      if (userCoordinates) {
        const userMarker = new window.google.maps.Marker({
          position: { lat: userCoordinates.lat, lng: userCoordinates.lng },
          map: googleMapRef.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 8,
          },
          title: 'Your location'
        });
        
        const infoWindow = new window.google.maps.InfoWindow({
          content: '<div style="font-weight: bold;">Your location</div>'
        });
        
        userMarker.addListener('click', () => {
          infoWindow.open(googleMapRef.current, userMarker);
        });
        
        markersRef.current.push(userMarker);
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
        
        const marker = new window.google.maps.Marker({
          position: { lat: coordinates.lat, lng: coordinates.lng },
          map: googleMapRef.current,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          },
          title: rec.name
        });
        
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="max-width: 200px;">
              <h3 style="font-weight: bold; margin-bottom: 4px;">${rec.name}</h3>
              <p style="font-size: 12px; color: #666;">${rec.address || ''}</p>
              <a href="/location/${rec.id}" style="color: blue; font-size: 12px; display: block; margin-top: 4px;">View Details</a>
            </div>
          `
        });
        
        marker.addListener('click', () => {
          infoWindow.open(googleMapRef.current, marker);
        });
        
        markersRef.current.push(marker);
      });
      
      // Add marketplace listing markers
      if (marketplaceListings && marketplaceListings.length > 0) {
        marketplaceListings.forEach(listing => {
          // Try to use direct latitude/longitude if available
          if (listing.latitude && listing.longitude) {
            const lat = Number(listing.latitude);
            const lng = Number(listing.longitude);
            
            const marker = new window.google.maps.Marker({
              position: { lat, lng },
              map: googleMapRef.current,
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
              },
              title: listing.title
            });
            
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="max-width: 200px;">
                  <h3 style="font-weight: bold; margin-bottom: 4px;">${listing.title}</h3>
                  <p style="font-size: 12px; color: #666;">₹${listing.price}</p>
                  <p style="font-size: 12px; color: #666;">${listing.location || ''}</p>
                  <a href="/marketplace/${listing.id}" style="color: blue; font-size: 12px; display: block; margin-top: 4px;">View Details</a>
                </div>
              `
            });
            
            marker.addListener('click', () => {
              infoWindow.open(googleMapRef.current, marker);
            });
            
            markersRef.current.push(marker);
          } 
          // Try to extract from map_link if direct coordinates aren't available
          else if (listing.map_link) {
            const coordinates = extractCoordinatesFromMapLink(listing.map_link);
            if (coordinates) {
              const marker = new window.google.maps.Marker({
                position: { lat: coordinates.lat, lng: coordinates.lng },
                map: googleMapRef.current,
                icon: {
                  url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
                },
                title: listing.title
              });
              
              const infoWindow = new window.google.maps.InfoWindow({
                content: `
                  <div style="max-width: 200px;">
                    <h3 style="font-weight: bold; margin-bottom: 4px;">${listing.title}</h3>
                    <p style="font-size: 12px; color: #666;">₹${listing.price}</p>
                    <p style="font-size: 12px; color: #666;">${listing.location || ''}</p>
                    <a href="/marketplace/${listing.id}" style="color: blue; font-size: 12px; display: block; margin-top: 4px;">View Details</a>
                  </div>
                `
              });
              
              marker.addListener('click', () => {
                infoWindow.open(googleMapRef.current, marker);
              });
              
              markersRef.current.push(marker);
            }
          }
        });
      }
    };

    initializeMap();

    return () => {
      // Clean up markers when component unmounts
      if (markersRef.current.length > 0) {
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
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
                {!mapLoaded && !mapError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                      <p className="text-muted-foreground">Loading map...</p>
                    </div>
                  </div>
                )}
                
                {mapError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center max-w-xl px-6">
                      <div className="mx-auto bg-amber-50 border border-amber-200 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                        <AlertCircle className="h-8 w-8 text-amber-500" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">Map Loading Error</h3>
                      <p className="text-muted-foreground mb-4">{mapError}</p>
                      <div className="text-sm text-muted-foreground bg-gray-50 p-4 rounded-md border border-border">
                        <p className="font-medium mb-2">Possible solutions:</p>
                        <ol className="list-decimal pl-5 space-y-1">
                          <li>Check that the Google Maps API key has been configured with proper domain restrictions</li>
                          <li>Ensure the Google Maps JavaScript API and Places API services are enabled</li>
                          <li>Try clearing your browser cache and refreshing the page</li>
                        </ol>
                      </div>
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
