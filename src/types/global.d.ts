
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
  google: {
    maps: {
      Map: typeof google.maps.Map;
      Marker: typeof google.maps.Marker;
      InfoWindow: typeof google.maps.InfoWindow;
      LatLngBounds: typeof google.maps.LatLngBounds;
      event: {
        addListener: typeof google.maps.event.addListener;
        addListenerOnce: typeof google.maps.event.addListenerOnce;
      };
    };
  };
  initMap?: () => void;
}

// Ensure google.maps namespace is globally available
declare namespace google.maps {
  export class Map {}
  export class Marker {}
  export class InfoWindow {}
  export class LatLngBounds {}
  export namespace event {
    export function addListener(): void;
    export function addListenerOnce(): void;
  }
}
