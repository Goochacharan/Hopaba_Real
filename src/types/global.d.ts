
// Global type definitions
interface Window {
  grecaptcha?: {
    ready: (callback: () => void) => void;
    execute: (siteKey: string, options: { action: string }) => Promise<string>;
    render: (container: string | HTMLElement, parameters: object) => string | number;
  };
  hcaptcha?: {
    ready: (callback: () => void) => void;
    execute: (siteKey: string, options?: object) => Promise<string>;
    render: (container: string | HTMLElement, parameters: object) => string | number;
  };
  onloadCallback?: () => void;
  
  // Google Maps related types
  google?: {
    maps: {
      Map: new (element: HTMLElement, options: {
        center: { lat: number, lng: number };
        zoom: number;
        [key: string]: any;
      }) => google.maps.Map;
      Marker: new (options: {
        position: { lat: number, lng: number };
        map?: google.maps.Map;
        title?: string;
        icon?: {
          url: string;
          scaledSize?: google.maps.Size;
        };
      }) => google.maps.Marker;
      InfoWindow: new (options: {
        content: string;
      }) => google.maps.InfoWindow;
      LatLngBounds: new () => google.maps.LatLngBounds;
      Size: new (width: number, height: number) => google.maps.Size;
      event: {
        addListener: (instance: any, eventName: string, handler: Function) => google.maps.MapsEventListener;
        addListenerOnce: (instance: any, eventName: string, handler: Function) => google.maps.MapsEventListener;
        removeListener: (listener: google.maps.MapsEventListener) => void;
      };
    };
  };
  initMap?: () => void;
}

// Ensure google.maps namespace is globally available
declare namespace google {
  namespace maps {
    interface Map {
      setCenter(position: { lat: number, lng: number }): void;
      setZoom(zoom: number): void;
      getZoom(): number;
      fitBounds(bounds: LatLngBounds): void;
    }
    
    interface Marker {
      setMap(map: Map | null): void;
      getPosition(): { lat: number, lng: number };
      addListener(eventName: string, handler: Function): MapsEventListener;
    }
    
    interface InfoWindow {
      open(map: Map, marker?: Marker): void;
      close(): void;
    }
    
    interface LatLngBounds {
      extend(position: { lat: number, lng: number } | { lat(): number, lng(): number }): void;
    }
    
    interface Size {
      width: number;
      height: number;
    }
    
    interface MapsEventListener {
      remove(): void;
    }
    
    class Map {}
    class Marker {}
    class InfoWindow {}
    class LatLngBounds {}
    class Size {}
    
    namespace event {
      function addListener(instance: any, eventName: string, handler: Function): MapsEventListener;
      function addListenerOnce(instance: any, eventName: string, handler: Function): MapsEventListener;
      function removeListener(listener: MapsEventListener): void;
    }
  }
}
