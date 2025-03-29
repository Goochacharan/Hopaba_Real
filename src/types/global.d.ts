
// Global type definitions
interface Window {
  grecaptcha?: {
    ready: (callback: () => void) => void;
    execute: (siteKey: string, options: { action: string }) => Promise<string>;
    render: (container: string | HTMLElement, parameters: object) => string | number;
  };
  onloadCallback?: () => void;
}
