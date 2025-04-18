
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SearchResults from "./pages/SearchResults";
import Settings from "./pages/Settings";
import Map from "./pages/Map";
import LocationDetails from "./pages/LocationDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import MyList from "./pages/MyList";
import Marketplace from "./pages/Marketplace";
import MarketplaceListingDetails from "./pages/MarketplaceListingDetails";
import Events from "./pages/Events";
import AdminPanel from "./pages/AdminPanel";
import SellerDetails from "./pages/SellerDetails";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <BrowserRouter>
      <LocationProvider>
        <WishlistProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/map" element={<Map />} />
            <Route path="/location/:id" element={<LocationDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-list" element={<MyList />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/:id" element={<MarketplaceListingDetails />} />
            <Route path="/events" element={<Events />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/seller/:id" element={<SellerDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </WishlistProvider>
      </LocationProvider>
    </BrowserRouter>
  );
}

export default App;
