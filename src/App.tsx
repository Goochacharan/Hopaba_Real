import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WishlistProvider } from "./contexts/WishlistContext";
import { AuthProvider } from "./hooks/useAuth";
import React from "react";
import Index from "./pages/Index";
import SearchResults from "./pages/SearchResults";
import LocationDetails from "./pages/LocationDetails";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import MyList from "./pages/MyList";
import Events from "./pages/Events";
import Map from "./pages/Map";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Marketplace from "./pages/Marketplace";
import MarketplaceListingDetails from "./pages/MarketplaceListingDetails";
import SellerDetails from "./pages/SellerDetails";
import AdminPanel from "./pages/AdminPanel";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/location/:id" element={<LocationDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/my-list" element={<MyList />} />
              <Route path="/events" element={<Events />} />
              <Route path="/map" element={<Map />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/marketplace/:id" element={<MarketplaceListingDetails />} />
              <Route path="/seller/:id" element={<SellerDetails />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
