
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Profile from '@/pages/Profile';
import Login from '@/pages/Login';
import Marketplace from '@/pages/Marketplace';
import BusinessListingForm from '@/components/business/BusinessFormSimple';
import MarketplaceListingDetails from '@/pages/MarketplaceListingDetails';
import { LocationProvider } from '@/contexts/LocationContext';
import { AuthProvider } from '@/hooks/useAuth';
import { ToastProvider } from '@/hooks/use-toast';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <LocationProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Marketplace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/business/add" element={
                <BusinessListingForm 
                  onSaved={() => console.log('Business saved')} 
                  onCancel={() => console.log('Business form cancelled')} 
                />
              } />
              <Route 
                path="/marketplace/:id" 
                element={
                  <MarketplaceListingDetails 
                    listing={{
                      id: '',
                      title: '',
                      price: 0,
                      description: '',
                      condition: '',
                      location: '',
                      seller_name: '',
                      created_at: new Date().toISOString(),
                      images: [],
                      category: '',
                      city: '',
                      area: '',
                      approval_status: 'approved'
                    }} 
                  />
                } 
              />
            </Routes>
          </Router>
        </LocationProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
