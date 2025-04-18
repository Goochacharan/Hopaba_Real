import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '@/pages/Home';
import SearchResults from '@/pages/SearchResults';
import RecommendationDetails from '@/pages/RecommendationDetails';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Profile from '@/pages/Profile';
import EditProfile from '@/pages/EditProfile';
import AddRecommendation from '@/pages/AddRecommendation';
import Marketplace from '@/pages/Marketplace';
import AddMarketplaceListing from '@/pages/AddMarketplaceListing';
import BusinessListingForm from '@/components/business/BusinessFormSimple';
import MarketplaceListingDetails from '@/pages/MarketplaceListingDetails';
import { AuthProvider } from '@/contexts/AuthContext';
import { LocationProvider } from '@/contexts/LocationContext';
import { ToastProvider } from '@/contexts/ToastContext';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <LocationProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/recommendation/:id" element={<RecommendationDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/add" element={<AddRecommendation />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/marketplace/add" element={<AddMarketplaceListing />} />
              <Route path="/business/add" element={<BusinessListingForm />} />
              <Route 
                path="/marketplace/:id" 
                element={
                  <MarketplaceListingDetails 
                    listing={{
                      // Default values that will be overridden when component loads
                      id: '',
                      title: '',
                      price: 0,
                      description: '',
                      condition: '',
                      location: '',
                      seller_name: '',
                      created_at: new Date().toISOString(),
                      images: []
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
