
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WishlistProvider } from "./contexts/WishlistContext";
import { AuthProvider } from "./hooks/useAuth";
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load route components
const SearchResults = React.lazy(() => import("./pages/SearchResults"));
const LocationDetails = React.lazy(() => import("./pages/LocationDetails"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Profile = React.lazy(() => import("./pages/Profile"));
const MyList = React.lazy(() => import("./pages/MyList"));
const Events = React.lazy(() => import("./pages/Events"));
const Map = React.lazy(() => import("./pages/Map"));
const Login = React.lazy(() => import("./pages/Login"));
const Signup = React.lazy(() => import("./pages/Signup"));
const Marketplace = React.lazy(() => import("./pages/Marketplace"));
const MarketplaceListingDetails = React.lazy(() => import("./pages/MarketplaceListingDetails"));
const SellerDetails = React.lazy(() => import("./pages/SellerDetails"));
const AdminPanel = React.lazy(() => import("./pages/AdminPanel"));
const Settings = React.lazy(() => import("./pages/Settings"));

const queryClient = new QueryClient();

// Loading component for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<SearchResults />} />
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
            </Suspense>
          </TooltipProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
