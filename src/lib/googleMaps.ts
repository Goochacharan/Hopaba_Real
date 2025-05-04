
// A flag to track if the script is already loaded or loading
let isGoogleMapsLoading = false;
let isGoogleMapsLoaded = false;
let loadPromise: Promise<boolean> | null = null;
let loadError: Error | null = null;

/**
 * Loads the Google Maps API script if it hasn't been loaded yet
 * @returns A promise that resolves when the API is loaded or rejects with an error
 */
export const loadGoogleMapsApi = (): Promise<boolean> => {
  // If already loaded, return resolved promise
  if (isGoogleMapsLoaded && window.google && window.google.maps) {
    return Promise.resolve(true);
  }
  
  // If we had an error before, return rejected promise with the same error
  if (loadError) {
    return Promise.reject(loadError);
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
      // Check if the API loaded successfully or if there's a RefererNotAllowed error
      if (window.google && window.google.maps) {
        isGoogleMapsLoaded = true;
        isGoogleMapsLoading = false;
        console.log('Google Maps API loaded successfully');
        resolve(true);
      } else {
        const error = new Error('Google Maps failed to load properly');
        loadError = error;
        isGoogleMapsLoading = false;
        reject(error);
      }
      
      // Clean up the callback
      // We don't delete it because it's declared in types, but we can make it a no-op
      window[callbackName] = function() {};
    };
    
    // Error handling
    script.onerror = (e) => {
      console.error('Failed to load Google Maps API', e);
      isGoogleMapsLoading = false;
      const error = new Error('Failed to load Google Maps API - Please check that your API key is configured correctly and has the proper domain authorizations');
      loadError = error;
      reject(error);
    };
    
    // Handle domain authorization errors
    window.gm_authFailure = () => {
      console.error('Google Maps authorization failure - API key is not authorized for this domain');
      isGoogleMapsLoading = false;
      const error = new Error('Google Maps API key is not authorized for this domain. Please add your domain to the allowed referrers in the Google Cloud Console.');
      loadError = error;
      reject(error);
    };
    
    // Append the script to the document
    document.head.appendChild(script);
  });
  
  return loadPromise;
};

// No need to redeclare the callback type since it's in global.d.ts
