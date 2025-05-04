
// Global type definitions
interface Window {
  grecaptcha?: {
    ready: (callback: () => void) => void;
    execute: (siteKey: string, options: { action: string }) => Promise<string>;
    render: (container: string | HTMLElement, parameters: object) => string | number;
  };
  hcaptcha?: {
    render: (element: HTMLElement | string, options: any) => number;
    reset: (widgetId?: number) => void;
    execute: (widgetId?: number) => void;
    ready: (callback: () => void) => void;
  };
  onloadCallback?: () => void;
  googleMapsCallback?: () => void;
  google?: {
    maps: {
      Map: new (container: HTMLElement, options?: google.maps.MapOptions) => google.maps.Map;
      Marker: new (options?: google.maps.MarkerOptions) => google.maps.Marker;
      InfoWindow: new (options?: google.maps.InfoWindowOptions) => google.maps.InfoWindow;
      LatLng: new (lat: number, lng: number) => google.maps.LatLng;
      Geocoder: new () => google.maps.Geocoder;
      MapOptions: google.maps.MapOptions;
      MapTypeId: {
        ROADMAP: string;
        SATELLITE: string;
        HYBRID: string;
        TERRAIN: string;
      };
      SymbolPath: {
        CIRCLE: number;
        FORWARD_CLOSED_ARROW: number;
        FORWARD_OPEN_ARROW: number;
        BACKWARD_CLOSED_ARROW: number;
        BACKWARD_OPEN_ARROW: number;
      };
    };
  };
}
