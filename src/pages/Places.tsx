
import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import SearchBar from '@/components/SearchBar';
import BusinessesList from '@/components/BusinessesList';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { BusinessFormValues } from '@/components/AddBusinessForm';

const Places = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [refresh, setRefresh] = useState(false);

  const handleSearch = (query: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}&tab=locations`);
    }
  };

  // This is a placeholder function since we don't have actual edit functionality on this page
  const handleEdit = (business: BusinessFormValues & { id: string }) => {
    console.log("Edit business requested:", business);
    // In a real implementation, this would navigate to an edit form or open a modal
    navigate(`/profile`);
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
        <BusinessesList 
          onEdit={handleEdit} 
          refresh={refresh}
        />
      </div>
    </MainLayout>
  );
};

export default Places;
