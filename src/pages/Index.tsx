
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import SearchBar from '@/components/SearchBar';
import Filters from '@/components/Filters';
import LocationCard from '@/components/LocationCard';
import { useServiceProviders } from '@/hooks/useServiceProviders';

export default function Index() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const { data: serviceProviders, isLoading, error } = useServiceProviders();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  const filteredData = serviceProviders && serviceProviders.length > 0
    ? serviceProviders
        .filter(item => 
          !searchQuery || 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
        )
        .filter(item => 
          selectedFilters.length === 0 || 
          (item.category && selectedFilters.includes(item.category))
        )
    : [];

  return (
    <MainLayout>
      <div className="py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Find Local Service Providers</h1>
          <p className="text-xl text-muted-foreground">
            Discover quality services in your area
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto mb-8">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Search for services or categories..."
          />
        </div>
        
        <Filters 
          selectedFilters={selectedFilters} 
          setSelectedFilters={setSelectedFilters} 
        />

        <div className="mt-8">
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              Error loading data. Please try again.
            </div>
          ) : filteredData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.map((item) => (
                <LocationCard key={item.id} recommendation={item} />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              No matching service providers found. Try adjusting your filters.
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
