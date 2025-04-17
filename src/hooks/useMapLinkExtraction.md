
# Map Link Extraction Guide

The application now automatically extracts geographic coordinates from Google Maps links pasted by users. This functionality is implemented across all forms (Business, Marketplace, and Event listings).

## How it works

1. When a user pastes a Google Maps link into the "Map Link" field, the application parses the URL to extract latitude and longitude.
2. The coordinates are automatically stored in hidden form fields and sent to the database with the form submission.
3. Users no longer need to manually enter coordinates.

## Supported Google Maps URL formats

- https://www.google.com/maps?q=12.9716,77.5946
- https://www.google.com/maps/@12.9716,77.5946,15z
- https://goo.gl/maps/XXXX (shortened URLs)
- https://maps.app.goo.gl/XXXXX
- https://maps.google.com/?ll=12.9716,77.5946

## Implementation details

- The `extractCoordinatesFromMapLink` function in `locationUtils.ts` handles the parsing logic.
- Each form has a useEffect hook that watches for changes to the map_link field and updates latitude/longitude fields.
- The coordinates are hidden from the UI but still stored in the form data.

## Adding to other forms

If you need to add this functionality to other forms:

1. Import the `useMapLinkCoordinates` hook or the `MapLinkExtractor` component
2. Add it to your form component
3. Ensure your form has latitude and longitude fields to store the extracted coordinates
