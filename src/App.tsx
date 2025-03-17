
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WishlistProvider } from "./contexts/WishlistContext";
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
import BusinessSignup from "./pages/BusinessSignup";
import BusinessDashboard from "./pages/BusinessDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WishlistProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/location/:id" element={<LocationDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-list" element={<MyList />} />
            <Route path="/events" element={<Events />} />
            <Route path="/map" element={<Map />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/business-signup" element={<BusinessSignup />} />
            <Route path="/business-dashboard" element={<BusinessDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </WishlistProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
