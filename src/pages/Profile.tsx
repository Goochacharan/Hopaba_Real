import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit, KeyRound, LogOut, Plus, User } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import BusinessesList from '@/components/BusinessesList';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBusinessTab, setShowBusinessTab] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setLoading(false);
    };

    getCurrentUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user && user.id) {
      setShowBusinessTab(true);
    } else {
      setShowBusinessTab(false);
    }
  }, [user]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container max-w-5xl py-8">
          <p>Loading profile...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-5xl py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">
                {user?.user_metadata?.full_name || user?.email}
              </h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full max-w-sm">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            {showBusinessTab && (
              <TabsTrigger value="businesses">
                <Edit className="w-4 h-4 mr-2" />
                Businesses
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="profile" className="mt-6">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input type="email" id="email" value={user?.email} readOnly />
                </div>
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    type="text"
                    id="fullName"
                    value={user?.user_metadata?.full_name || ''}
                    readOnly
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="userId">User ID</Label>
                <Input type="text" id="userId" value={user?.id} readOnly />
              </div>
              <Button variant="default" onClick={() => navigate('/update-password')}>
                <KeyRound className="w-4 h-4 mr-2" />
                Update Password
              </Button>
            </div>
          </TabsContent>
          {showBusinessTab && (
            <TabsContent value="businesses" className="mt-6">
              <BusinessesList 
                userId={user?.id} 
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Profile;
