
import React from 'react';

const ListingDetailsLoading = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl animate-pulse">
      <div className="mb-8 h-6 bg-gray-200 rounded w-1/4"></div>
      <div className="grid grid-cols-1 gap-8">
        <div>
          <div className="h-[450px] bg-gray-200 rounded-xl mb-4"></div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailsLoading;
