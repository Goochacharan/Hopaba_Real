
import React from 'react';
import { MarketplaceListingWithDistance } from '@/types/marketplace';

interface MarketplaceListingDetailsProps {
  listing: MarketplaceListingWithDistance;
}

const MarketplaceListingDetails: React.FC<MarketplaceListingDetailsProps> = ({ listing }) => {
  return (
    <div className="mt-8 p-4 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">{listing.title}</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <p className="text-xl font-semibold">₹{listing.price}</p>
          <p className="text-muted-foreground">{listing.condition}</p>
          <p className="mt-4">{listing.description}</p>
        </div>
        <div>
          <p><strong>Location:</strong> {listing.location}</p>
          {listing.distance !== undefined && (
            <p><strong>Distance:</strong> {typeof listing.distance === 'number' ? `${listing.distance.toFixed(1)} km` : listing.distance}</p>
          )}
          <p><strong>Seller:</strong> {listing.seller_name}</p>
          {listing.seller_rating && (
            <p><strong>Rating:</strong> {listing.seller_rating}/5</p>
          )}
          <p><strong>Listed:</strong> {new Date(listing.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceListingDetails;
