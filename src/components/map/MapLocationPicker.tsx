
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertCircle, MapPin, Check } from "lucide-react";
import { extractCoordinatesFromMapLink } from '@/lib/locationUtils';

interface MapLocationPickerProps {
  open: boolean;
  onClose: () => void;
  onLocationSelected: (location: { lat: number; lng: number; address?: string }) => void;
  initialLocation?: { lat?: number; lng?: number; address?: string; mapLink?: string };
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  open,
  onClose,
  onLocationSelected,
  initialLocation
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Initial coordinates (Bangalore by default)
  const defaultCenter = { lat: 12.9716, lng: 77.5946 };
  
  // Handle initialLocation if provided
  useEffect(() => {
    if (!open) return;
    
    if (initialLocation?.lat && initialLocation?.lng) {
      setSelectedLocation({
        lat: initialLocation.lat,
        lng: initialLocation.lng,
        address: initialLocation.address
      });
    } else if (initialLocation?.mapLink) {
      const coords = extractCoordinatesFromMapLink(initialLocation.mapLink);
      if (coords) {
        setSelectedLocation({
          lat: coords.lat,
          lng: coords.lng,
          address: initialLocation.address
        });
      }
    }
  }, [initialLocation, open]);

  // Load Google Maps API
  useEffect(() => {
    if (!open || !mapRef.current) return;
    
    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps) {
      initMap();
      return;
    }
    
    const apiKey = 'AIzaSyDk4C4EBWgjuL1eBnJlu1J80WytEtSIags'; // Updated API key
    setIsLoading(true);
    
    // Load Google Maps API script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initMap();
      setIsLoading(false);
    };
    script.onerror = (e) => {
      console.error('Failed to load Google Maps', e);
      setLoadError('Failed to load Google Maps. Please try again later.');
      setIsLoading(false);
    };
    
    document.head.appendChild(script);
    
    return () => {
      if (googleMapRef.current) {
        // Clean up map instance
        googleMapRef.current = null;
      }
      if (markerRef.current) {
        // Clean up marker
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    };
  }, [open]);

  // Initialize map when API is loaded
  const initMap = () => {
    if (!mapRef.current || !window.google) return;
    
    // Determine center - use selected location if available, otherwise use default
    const center = selectedLocation 
      ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
      : defaultCenter;
    
    // Create the map
    googleMapRef.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 15,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
    });
    
    // Add marker if selected location exists
    if (selectedLocation) {
      addMarker(selectedLocation.lat, selectedLocation.lng);
    }
    
    // Add click event listener for the map
    googleMapRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      
      addMarker(newLat, newLng);
      
      // Get the address for the selected coordinates
      getAddressFromCoords(newLat, newLng)
        .then(address => {
          setSelectedLocation({
            lat: newLat,
            lng: newLng,
            address
          });
        })
        .catch(() => {
          setSelectedLocation({
            lat: newLat,
            lng: newLng,
          });
        });
    });
    
    setIsLoading(false);
  };
  
  // Add marker to the map
  const addMarker = (lat: number, lng: number) => {
    if (!googleMapRef.current) return;
    
    // Remove existing marker if any
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
    
    // Create new marker
    markerRef.current = new window.google.maps.Marker({
      position: { lat, lng },
      map: googleMapRef.current,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
    });
    
    // Add drag end event to update coordinates
    markerRef.current.addListener('dragend', () => {
      if (!markerRef.current) return;
      
      const position = markerRef.current.getPosition();
      if (!position) return;
      
      const lat = position.lat();
      const lng = position.lng();
      
      // Get address for new position
      getAddressFromCoords(lat, lng)
        .then(address => {
          setSelectedLocation({
            lat,
            lng,
            address
          });
        })
        .catch(() => {
          setSelectedLocation({
            lat,
            lng,
          });
        });
    });
  };
  
  // Get address from coordinates using Geocoder
  const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject('Google Maps not loaded');
        return;
      }
      
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject('No address found for this location');
        }
      });
    });
  };
  
  const handleLocationSelect = () => {
    if (!selectedLocation) return;
    
    onLocationSelected(selectedLocation);
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Select Location
          </DialogTitle>
        </DialogHeader>
        
        {isLoading && (
          <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        
        {loadError && (
          <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p>{loadError}</p>
            </div>
          </div>
        )}
        
        {!isLoading && !loadError && (
          <>
            <div ref={mapRef} className="h-[400px] rounded-lg border" />
            
            {selectedLocation && (
              <div className="mt-4 space-y-2 bg-muted/50 p-3 rounded-md">
                <div className="text-sm font-medium">Selected Location:</div>
                {selectedLocation.address && (
                  <div className="text-sm break-words">{selectedLocation.address}</div>
                )}
                <div className="text-xs text-muted-foreground">
                  Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                </div>
              </div>
            )}
          </>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleLocationSelect} 
            disabled={!selectedLocation || isLoading}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Use This Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MapLocationPicker;
