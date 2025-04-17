
declare global {
  interface Window {
    MapmyIndia: {
      Map: new (
        element: HTMLElement, 
        options: {
          center: [number, number];
          zoom: number;
          search?: boolean;
          [key: string]: any;
        }
      ) => any;
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
      }) => any;
    };
  }
}

export {};
