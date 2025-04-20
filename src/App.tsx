import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { WishlistProvider } from "./contexts/WishlistContext";
import { AuthProvider } from "./hooks/useAuth";
import React, { Suspense, useEffect } from "react";
import { Loader2 } from "lucide-react";

// Lazy load route components with chunks named for better debugging
const SearchResults = React.lazy(() => import(/* webpackChunkName: "search-results" */ "./pages/SearchResults"));
const LocationDetails = React.lazy(() => import(/* webpackChunkName: "location-details" */ "./pages/LocationDetails"));
const NotFound = React.lazy(() => import(/* webpackChunkName: "not-found" */ "./pages/NotFound"));
const Profile = React.lazy(() => import(/* webpackChunkName: "profile" */ "./pages/Profile"));
const MyList = React.lazy(() => import(/* webpackChunkName: "my-list" */ "./pages/MyList"));
const Events = React.lazy(() => import(/* webpackChunkName: "events" */ "./pages/Events"));
const Map = React.lazy(() => import(/* webpackChunkName: "map" */ "./pages/Map"));
const Login = React.lazy(() => import(/* webpackChunkName: "login" */ "./pages/Login"));
const Signup = React.lazy(() => import(/* webpackChunkName: "signup" */ "./pages/Signup"));
const Marketplace = React.lazy(() => import(/* webpackChunkName: "marketplace" */ "./pages/Marketplace"));
const MarketplaceListingDetails = React.lazy(() => import(/* webpackChunkName: "marketplace-listing" */ "./pages/MarketplaceListingDetails"));
const SellerDetails = React.lazy(() => import(/* webpackChunkName: "seller-details" */ "./pages/SellerDetails"));
const AdminPanel = React.lazy(() => import(/* webpackChunkName: "admin-panel" */ "./pages/AdminPanel"));
const Settings = React.lazy(() => import(/* webpackChunkName: "settings" */ "./pages/Settings"));

// Configure Query Client with performance optimizations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
      gcTime: 1000 * 60 * 30, // Cache persists for 30 minutes (renamed from cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading component with better UX
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background/50 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">Loading...</span>
    </div>
  </div>
);

// Route prefetching component
const RoutePrefetcher = () => {
  const location = useLocation();

  useEffect(() => {
    // Prefetch adjacent routes based on current location
    const prefetchRoutes = () => {
      if (location.pathname === '/') {
        import("./pages/SearchResults");
        import("./pages/Marketplace");
      } else if (location.pathname.startsWith('/marketplace')) {
        import("./pages/MarketplaceListingDetails");
        import("./pages/SellerDetails");
      }
    };

    prefetchRoutes();
  }, [location]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <RoutePrefetcher />
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
