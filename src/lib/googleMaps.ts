
// A flag to track if the script is already loaded or loading
let isGoogleMapsLoading = false;
let isGoogleMapsLoaded = false;
let loadPromise: Promise<boolean> | null = null;

/**
 * Loads the Google Maps API script if it hasn't been loaded yet
 * @returns A promise that resolves when the API is loaded
 */
export const loadGoogleMapsApi = (): Promise<boolean> => {
  // If already loaded, return resolved promise
  if (isGoogleMapsLoaded && window.google && window.google.maps) {
    return Promise.resolve(true);
  }
  
  // If already loading, return the existing promise
  if (isGoogleMapsLoading && loadPromise) {
    return loadPromise;
  }
  
  isGoogleMapsLoading = true;
  
  loadPromise = new Promise<boolean>((resolve, reject) => {
    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps) {
      isGoogleMapsLoaded = true;
      console.log('Google Maps API already loaded');
      resolve(true);
      return;
    }
    
    // Create a unique callback name to avoid conflicts
    const callbackName = 'googleMapsCallback';
    
    const apiKey = 'AIzaSyDNcOs1gMb2kevWEZXWdfSykt1NBXIEqjE';
    
    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    
    // Define callback function in global scope
    window[callbackName] = function() {
      isGoogleMapsLoaded = true;
      isGoogleMapsLoading = false;
      console.log('Google Maps API loaded successfully');
      resolve(true);
      
      // Clean up the callback
      // We don't delete it because it's declared in types, but we can make it a no-op
      window[callbackName] = function() {};
    };
    
    // Error handling
    script.onerror = (e) => {
      console.error('Failed to load Google Maps API', e);
      isGoogleMapsLoading = false;
      reject(new Error('Failed to load Google Maps API'));
    };
    
    // Append the script to the document
    document.head.appendChild(script);
  });
  
  return loadPromise;
};

// No need to redeclare the callback type since it's in global.d.ts
