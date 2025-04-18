
declare global {
  interface Window {
    MapmyIndia?: {
      Map: new (
        element: HTMLElement, 
        options: {
          center: [number, number];
          zoom: number;
          search?: boolean;
          [key: string]: any;
        }
      ) => {
        addEventListener: (event: string, callback: () => void) => void;
        remove: () => void;
        setCenter: (position: [number, number]) => void;
        setZoom: (zoom: number) => void;
        fitBounds: (bounds: any) => void;
      };
      Marker: new (options: {
        position: [number, number];
        map: any;
        icon?: {
          url: string;
          width: number;
          height: number;
        };
        draggable?: boolean;
        popupHtml?: string;
        [key: string]: any;
      }) => {
        remove: () => void;
        getPosition: () => [number, number];
      };
      LatLngBounds: new () => {
        extend: (latLng: [number, number]) => void;
      };
    };
  }
}

export {};
