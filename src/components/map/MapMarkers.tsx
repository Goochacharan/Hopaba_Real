
import React from 'react';
import { toast } from '@/hooks/use-toast';

interface MapMarkersProps {
  map: google.maps.Map;
  recommendations: any[];
  marketplaceListings: any[];
  userCoordinates: { lat: number; lng: number } | null;
  markers: React.MutableRefObject<google.maps.Marker[]>;
  infoWindows: React.MutableRefObject<google.maps.InfoWindow[]>;
}

const MapMarkers: React.FC<MapMarkersProps> = ({
  map,
  recommendations,
  marketplaceListings,
  userCoordinates,
  markers,
  infoWindows,
}) => {
  const addMarkers = () => {
    if (!map || !window.google) return;
    
    try {
      console.log("Starting to add markers to map");
      
      // Clear existing markers and info windows
      markers.current.forEach(marker => marker.setMap(null));
      markers.current = [];
      infoWindows.current.forEach(infoWindow => infoWindow.close());
      infoWindows.current = [];
      
      // Add user location marker if available
      if (userCoordinates) {
        addUserMarker(userCoordinates);
      }
      
      // Add service provider markers
      const allRecommendations = [...recommendations];
      if (allRecommendations.length > 0) {
        addServiceProviderMarkers(allRecommendations);
      }
      
      // Add marketplace listing markers
      if (marketplaceListings.length > 0) {
        addMarketplaceMarkers(marketplaceListings);
      }
      
      // Fit bounds to show all markers
      fitMapBounds();
      
    } catch (error) {
      console.error('Error in addMarkers function:', error);
      toast({
        variant: "destructive",
        title: "Error adding markers",
        description: "Failed to add markers to the map",
      });
    }
  };
  
  const addUserMarker = (coordinates: { lat: number; lng: number }) => {
    const userMarker = new window.google.maps.Marker({
      position: coordinates,
      map,
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        scaledSize: new window.google.maps.Size(32, 32)
      },
      title: 'Your Location'
    });
    
    const userInfoWindow = new window.google.maps.InfoWindow({
      content: '<div><strong>Your location</strong></div>'
    });
    
    userMarker.addListener('click', () => {
      infoWindows.current.forEach(window => window.close());
      userInfoWindow.open(map, userMarker);
    });
    
    markers.current.push(userMarker);
    infoWindows.current.push(userInfoWindow);
  };
  
  const addServiceProviderMarkers = (providers: any[]) => {
    providers.forEach((provider) => {
      const coords = getCoordinates(provider);
      if (coords) {
        addProviderMarker(provider, coords);
      }
    });
  };
  
  const addMarketplaceMarkers = (listings: any[]) => {
    listings.forEach((listing) => {
      const coords = getCoordinates(listing);
      if (coords) {
        addMarketplaceMarker(listing, coords);
      }
    });
  };
  
  const getCoordinates = (item: any) => {
    if (item.latitude && item.longitude) {
      const lat = parseFloat(item.latitude);
      const lng = parseFloat(item.longitude);
      
      // Validate that we have valid numerical coordinates
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
      console.log(`Invalid coordinates for item ${item.id}: lat=${item.latitude}, lng=${item.longitude}`);
    }
    return null;
  };
  
  const addProviderMarker = (provider: any, coords: { lat: number; lng: number }) => {
    const marker = new window.google.maps.Marker({
      position: coords,
      map,
      title: provider.name || 'Business'
    });
    
    const infoContent = `
      <div style="max-width: 250px; padding: 8px;">
        <h3 style="margin-top: 0; font-weight: bold;">${provider.name || 'Business'}</h3>
        <p style="margin: 5px 0;">${provider.address || provider.area || ''}</p>
        ${provider.category ? `<p style="margin: 5px 0; font-style: italic;">${provider.category}</p>` : ''}
        <button 
          style="background: #4f46e5; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 5px;"
          onclick="window.location.href='/location/${provider.id}'"
        >
          View Details
        </button>
      </div>
    `;
    
    const infoWindow = new window.google.maps.InfoWindow({ content: infoContent });
    
    marker.addListener('click', () => {
      infoWindows.current.forEach(window => window.close());
      infoWindow.open(map, marker);
    });
    
    markers.current.push(marker);
    infoWindows.current.push(infoWindow);
  };
  
  const addMarketplaceMarker = (listing: any, coords: { lat: number; lng: number }) => {
    const marker = new window.google.maps.Marker({
      position: coords,
      map,
      title: listing.title || 'Marketplace Listing',
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
        scaledSize: new window.google.maps.Size(32, 32)
      }
    });
    
    const infoContent = `
      <div style="max-width: 250px; padding: 8px;">
        <h3 style="margin-top: 0; font-weight: bold;">${listing.title || 'Listing'}</h3>
        <p style="margin: 5px 0;">${listing.price ? '₹' + listing.price : ''}</p>
        <p style="margin: 5px 0;">${listing.location || ''}</p>
        <button 
          style="background: #4f46e5; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 5px;"
          onclick="window.location.href='/marketplace/${listing.id}'"
        >
          View Details
        </button>
      </div>
    `;
    
    const infoWindow = new window.google.maps.InfoWindow({ content: infoContent });
    
    marker.addListener('click', () => {
      infoWindows.current.forEach(window => window.close());
      infoWindow.open(map, marker);
    });
    
    markers.current.push(marker);
    infoWindows.current.push(infoWindow);
  };
  
  const fitMapBounds = () => {
    if (markers.current.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markers.current.forEach(marker => {
        bounds.extend(marker.getPosition()!);
      });
      
      map.fitBounds(bounds);
      
      window.google.maps.event.addListenerOnce(map, 'idle', () => {
        if (map.getZoom()! > 16) {
          map.setZoom(16);
        }
      });
    } else {
      map.setCenter({ lat: 12.9716, lng: 77.5946 });
      map.setZoom(12);
    }
  };

  React.useEffect(() => {
    addMarkers();
  }, [recommendations, marketplaceListings, userCoordinates]);

  return null;
};

export default MapMarkers;
