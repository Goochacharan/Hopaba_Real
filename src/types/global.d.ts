
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
  google?: typeof google;
  initMap?: () => void;
}
