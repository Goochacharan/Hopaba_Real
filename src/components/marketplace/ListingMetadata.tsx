import React from 'react';

interface ListingMetadataProps {
  location: string;
  createdAt: string;
  condition: string;
}

// This component now doesn't display any metadata visually
// But keeps the props interface for backward compatibility
const ListingMetadata: React.FC<ListingMetadataProps> = () => {
  return null;
};

export default ListingMetadata;
