
import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGoogleMapsKey } from '@/hooks/useGoogleMapsKey';

interface MapViewProps {
  businesses: any[];
}

const MapView: React.FC<MapViewProps> = ({ businesses }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  const infoWindows = useRef<google.maps.InfoWindow[]>([]);
  const { toast } = useToast();
  const { fetchApiKey } = useGoogleMapsKey();
  const defaultCenter = { lat: 12.9716, lng: 77.5946 }; // Default to Bengaluru

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainer.current || map.current) return;

      try {
        const apiKey = await fetchApiKey();
        if (!apiKey) {
          setMapError('Failed to load Google Maps API key');
          return;
        }

        if (!window.google) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
          script.async = true;
          script.onload = () => {
            setMapLoaded(true);
            createMap();
          };
          script.onerror = () => {
            setMapError('Failed to load Google Maps');
          };
          document.head.appendChild(script);
        } else {
          setMapLoaded(true);
          createMap();
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Error initializing map');
      }
    };

    initializeMap();

    return () => {
      // Cleanup markers and info windows
      markers.current.forEach(marker => marker.setMap(null));
      infoWindows.current.forEach(window => window.close());
    };
  }, []);

  const createMap = () => {
    if (!mapContainer.current || !window.google) return;

    map.current = new window.google.maps.Map(mapContainer.current, {
      center: defaultCenter,
      zoom: 12,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });

    addMarkers();
  };

  const addMarkers = () => {
    if (!map.current || !businesses.length) return;

    const bounds = new window.google.maps.LatLngBounds();

    businesses.forEach((business) => {
      if (!business.latitude || !business.longitude) return;

      const position = {
        lat: parseFloat(business.latitude),
        lng: parseFloat(business.longitude),
      };

      const marker = new window.google.maps.Marker({
        position,
        map: map.current,
        title: business.name,
      });

      const infoContent = `
        <div style="max-width: 200px;">
          <h3 style="margin: 0 0 8px; font-weight: bold;">${business.name}</h3>
          <p style="margin: 0 0 8px;">${business.address || ''}</p>
          <a href="/business/${business.id}" style="color: #4F46E5; text-decoration: none;">View Details</a>
        </div>
      `;

      const infoWindow = new window.google.maps.InfoWindow({
        content: infoContent,
      });

      marker.addListener('click', () => {
        infoWindows.current.forEach(window => window.close());
        infoWindow.open(map.current!, marker);
      });

      markers.current.push(marker);
      infoWindows.current.push(infoWindow);
      bounds.extend(position);
    });

    // Only adjust bounds if we have markers
    if (markers.current.length > 0) {
      map.current.fitBounds(bounds);
      // Don't zoom in too far on single marker
      if (map.current.getZoom()! > 16) {
        map.current.setZoom(16);
      }
    }
  };

  useEffect(() => {
    if (mapLoaded && map.current) {
      addMarkers();
    }
  }, [businesses, mapLoaded]);

  if (mapError) {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-center">
        <p className="text-destructive">{mapError}</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden border border-border">
      {!mapLoaded && (
        <div className="flex items-center justify-center h-[600px] bg-muted/10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
      <div
        ref={mapContainer}
        className="w-full h-[600px]"
        style={{ display: mapLoaded ? 'block' : 'none' }}
      />
    </div>
  );
};

export default MapView;
