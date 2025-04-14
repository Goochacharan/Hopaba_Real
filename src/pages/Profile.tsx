import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import UserMarketplaceListings from '@/components/UserMarketplaceListings';
import UserEventListings from '@/components/UserEventListings';
import { AdminSection } from '@/components/admin/AdminSection';
import { Plus, Settings as SettingsIcon, LogOut, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BusinessFormSimple from '@/components/business/BusinessFormSimple';
import BusinessListSimple from '@/components/business/BusinessListSimple';
import { Business } from '@/components/business/BusinessFormSimple';
import { useWishlist } from '@/contexts/WishlistContext';
import LocationCard from '@/components/LocationCard';
import MarketplaceListingCard from '@/components/MarketplaceListingCard';
import EventCard from '@/components/EventCard';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [refreshBusinesses, setRefreshBusinesses] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [showAddBusinessForm, setShowAddBusinessForm] = useState(false);
  const [activeTab, setActiveTab] = useState("listings");
  const { wishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleAddBusiness = () => {
    setEditingBusiness(null);
    setShowAddBusinessForm(true);
    setActiveTab("businesses");
  };

  const handleEditBusiness = (business: Business) => {
    setEditingBusiness(business);
    setShowAddBusinessForm(true);
    setActiveTab("businesses");
  };

  const handleBusinessSaved = () => {
    console.log("Business saved, refreshing list");
    toast({
      title: "Success",
      description: editingBusiness ? "Business updated successfully" : "Business created successfully"
    });
    setEditingBusiness(null);
    setShowAddBusinessForm(false);
    setRefreshBusinesses(prev => !prev);
  };

  const handleCancelBusinessForm = () => {
    setEditingBusiness(null);
    setShowAddBusinessForm(false);
  };

  if (!user) {
    return <MainLayout>
        <div className="container mx-auto py-8 min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                You need to be logged in to view your profile.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate('/login')} className="w-full">
                Go to Login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </MainLayout>;
  }

  return <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col mb-8">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-muted-foreground mb-3">
            {user.user_metadata?.full_name || user.email}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/settings')} className="flex items-center gap-2" size="sm">
              <SettingsIcon className="h-4 w-4" />
              Settings
            </Button>
            <Button variant="outline" onClick={logout} size="sm" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {isAdmin && <AdminSection />}

        {showAddBusinessForm ? <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingBusiness ? 'Edit Business' : 'Add Business'}</CardTitle>
              <CardDescription>
                {editingBusiness ? 'Update your business information' : 'List your business or service'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BusinessFormSimple business={editingBusiness} onSaved={handleBusinessSaved} onCancel={handleCancelBusinessForm} />
            </CardContent>
          </Card> : <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="listings">Marketplace</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="businesses">Your Businesses</TabsTrigger>
              <TabsTrigger value="wishlist">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span>Wishlist</span>
                </div>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="listings">
              <UserMarketplaceListings />
            </TabsContent>
            
            <TabsContent value="events">
              <UserEventListings />
            </TabsContent>
            
            <TabsContent value="businesses">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Business Listings</h2>
                <Button onClick={handleAddBusiness} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Business
                </Button>
              </div>

              <BusinessListSimple onEdit={handleEditBusiness} refresh={refreshBusinesses} />
            </TabsContent>

            <TabsContent value="wishlist">
              <WishlistContent />
            </TabsContent>
          </Tabs>}
      </div>
    </MainLayout>;
};

const WishlistContent = () => {
  if (wishlist.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Heart className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-lg">Your wishlist is empty</h3>
        <p className="text-muted-foreground">
          Add items to your wishlist by clicking the heart icon on any location card or marketplace listing.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wishlist.map(item => {
        if (item.type === 'marketplace') {
          return (
            <div key={item.id} className="relative group">
              <MarketplaceListingCard listing={item} className="search-result-card" />
              <button
                className="absolute top-2 right-2 p-2 rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all z-10 text-rose-500"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(item);
                }}
              >
                <Heart className="h-4 w-4 fill-rose-500" />
              </button>
            </div>
          );
        } else if (item.type === 'event') {
          return (
            <div key={item.id} className="relative group">
              <EventCard event={item} className="search-result-card" />
              <button
                className="absolute top-2 right-2 p-2 rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all z-10 text-rose-500"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(item);
                }}
              >
                <Heart className="h-4 w-4 fill-rose-500" />
              </button>
            </div>
          );
        } else {
          return (
            <div key={item.id} className="relative group">
              <LocationCard recommendation={item} className="search-result-card" />
              <button
                className="absolute top-2 right-2 p-2 rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all z-10 text-rose-500"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(item);
                }}
              >
                <Heart className="h-4 w-4 fill-rose-500" />
              </button>
            </div>
          );
        }
      })}
    </div>
  );
};

export default Profile;
