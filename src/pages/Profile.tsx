
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import UserMarketplaceListings from '@/components/UserMarketplaceListings';
import UserEventListings from '@/components/UserEventListings';
import BusinessesList from '@/components/BusinessesList';
import { AdminSection } from '@/components/admin/AdminSection';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [refreshBusinesses, setRefreshBusinesses] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<any | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleAddBusiness = () => {
    setEditingBusiness(null);
  };

  const handleEditBusiness = (business: any) => {
    setEditingBusiness(business);
  };

  const handleBusinessSaved = () => {
    setEditingBusiness(null);
    setRefreshBusinesses(prev => !prev);
  };

  if (!user) {
    return (
      <MainLayout>
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
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <p className="text-muted-foreground">
              {user.user_metadata?.full_name || user.email}
            </p>
          </div>
          <Button variant="outline" onClick={logout}>
            Sign Out
          </Button>
        </div>

        {isAdmin && <AdminSection />}

        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="listings">Your Listings</TabsTrigger>
            <TabsTrigger value="events">Your Events</TabsTrigger>
            <TabsTrigger value="businesses">Your Businesses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="listings">
            <UserMarketplaceListings />
          </TabsContent>
          
          <TabsContent value="events">
            <UserEventListings />
          </TabsContent>
          
          <TabsContent value="businesses">
            <BusinessesList
              onEdit={handleEditBusiness}
              refresh={refreshBusinesses}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Profile;
