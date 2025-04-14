
import React from 'react';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/SearchBar';
import BusinessesList from '@/components/BusinessesList';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Places = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSearch = (query: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}&tab=locations`);
    }
  };

  return (
    <MainLayout>
      <div className="w-full max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search for businesses and services..."
            initialValue=""
            currentRoute="/places"
          />
        </div>
        <BusinessesList />
      </div>
    </MainLayout>
  );
};

export default Places;
