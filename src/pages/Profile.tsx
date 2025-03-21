import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { useToast } from '@/hooks/use-toast';
import AddBusinessForm from '@/components/AddBusinessForm';
import BusinessesList from '@/components/BusinessesList';
import UserMarketplaceListings from '@/components/UserMarketplaceListings';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { User, Bell, Shield, Globe, UserCog, Save, Settings, Moon, LogOut, Plus, Store, ListPlus, ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BusinessFormValues } from '@/components/AddBusinessForm';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters."
  }),
  email: z.string().email({
    message: "Please enter a valid email address."
  }),
  phone: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, {
    message: "Password must be at least 8 characters."
  }).optional(),
  confirmPassword: z.string().optional()
}).refine(data => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Current password is required when setting a new password.",
  path: ["currentPassword"]
}).refine(data => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match.",
  path: ["confirmPassword"]
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;
const defaultValues: Partial<ProfileFormValues> = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567"
};
const Profile = () => {
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  const [businessToEdit, setBusinessToEdit] = useState<(BusinessFormValues & {
    id: string;
  }) | null>(null);
  const [refreshBusinessList, setRefreshBusinessList] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [marketplaceListingToEdit, setMarketplaceListingToEdit] = useState<MarketplaceListing | null>(null);
  const [showMarketplaceForm, setShowMarketplaceForm] = useState(false);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange"
  });
  function onSubmit(data: ProfileFormValues) {
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully."
    });
    console.log(data);
  }
  const handleLogout = async () => {
    const {
      error
    } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been signed out"
      });
      navigate('/');
    }
  };
  const handleEditBusiness = (business: BusinessFormValues & {
    id: string;
  }) => {
    setBusinessToEdit(business);
    setShowAddForm(true);
    setActiveTab("services");
  };
  const handleEditMarketplaceListing = (listing: MarketplaceListing) => {
    setMarketplaceListingToEdit(listing);
    setShowMarketplaceForm(true);
    setActiveTab("marketplace");
  };
  const handleAddNewBusiness = () => {
    setBusinessToEdit(null);
    setShowAddForm(true);
  };
  const handleBusinessSaved = () => {
    setShowAddForm(false);
    setBusinessToEdit(null);
    setRefreshBusinessList(!refreshBusinessList);
    toast({
      title: "Success",
      description: "Your business listing has been saved successfully."
    });
  };
  const handleMarketplaceListingSaved = () => {
    setShowMarketplaceForm(false);
    setMarketplaceListingToEdit(null);
    toast({
      title: "Success",
      description: "Your marketplace listing has been saved successfully."
    });
  };
  return <MainLayout>
      <section className="w-full py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Profile</h1>
              <p className="text-muted-foreground text-lg">
                Manage your account settings and preferences
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className="bg-muted/30 rounded-lg p-1 mb-2">
              <TabsList className="w-full grid grid-cols-4 h-auto p-0">
                <TabsTrigger value="account" className="flex items-center gap-2 py-3 px-4 text-base">
                  <User className="h-5 w-5" />
                  Account
                </TabsTrigger>
                <TabsTrigger value="services" className="flex items-center gap-2 py-3 px-4 text-base">
                  <Store className="h-5 w-5" />
                  Business/Services
                </TabsTrigger>
                <TabsTrigger value="marketplace" className="flex items-center gap-2 py-0 text-sm px-[48px]">
                  <ShoppingBag className="h-5 w-5" />
                  Marketplace
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center gap-2 py-3 px-4 text-base">
                  <Settings className="h-5 w-5" />
                  Preferences
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="account" className="space-y-6">
              <div className="bg-white rounded-xl shadow-md border border-border p-8 w-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <UserCog className="h-6 w-6 mr-2 text-primary" />
                    <h2 className="text-2xl font-semibold">Personal Information</h2>
                  </div>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField control={form.control} name="name" render={({
                      field
                    }) => <FormItem>
                            <FormLabel className="text-base">Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" className="h-12" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />
                      
                      <FormField control={form.control} name="email" render={({
                      field
                    }) => <FormItem>
                            <FormLabel className="text-base">Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Your email" className="h-12" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />
                    </div>
                    
                    <FormField control={form.control} name="phone" render={({
                    field
                  }) => <FormItem>
                          <FormLabel className="text-base">Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Your phone number" className="h-12" {...field} />
                          </FormControl>
                          <FormDescription className="text-sm">
                            Used for verification and important notifications
                          </FormDescription>
                          <FormMessage />
                        </FormItem>} />
                    
                    <Separator className="my-8" />
                    
                    <div>
                      <h3 className="text-xl font-semibold mb-6">Change Password</h3>
                      
                      <div className="space-y-6">
                        <FormField control={form.control} name="currentPassword" render={({
                        field
                      }) => <FormItem>
                              <FormLabel className="text-base">Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Current password" className="h-12" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>} />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <FormField control={form.control} name="newPassword" render={({
                          field
                        }) => <FormItem>
                                <FormLabel className="text-base">New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="New password" className="h-12" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>} />
                          
                          <FormField control={form.control} name="confirmPassword" render={({
                          field
                        }) => <FormItem>
                                <FormLabel className="text-base">Confirm Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Confirm new password" className="h-12" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button type="submit" size="lg" className="px-8">
                        <Save className="mr-2 h-5 w-5" />
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              <div className="bg-white rounded-xl shadow-md border border-border p-8 w-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Store className="h-6 w-6 mr-2 text-primary" />
                    <h2 className="text-2xl font-semibold">
                      {showAddForm ? businessToEdit ? "Edit Business or Service" : "Add Business or Service" : "Your Businesses and Services"}
                    </h2>
                  </div>
                  {!showAddForm && <Button size="lg" onClick={handleAddNewBusiness} className="flex items-center gap-2">
                      <ListPlus className="h-5 w-5" />
                      Add New Business
                    </Button>}
                  {showAddForm && <Button variant="outline" size="lg" onClick={() => {
                  setShowAddForm(false);
                  setBusinessToEdit(null);
                }}>
                      Back to List
                    </Button>}
                </div>
                
                {showAddForm ? <>
                    <p className="text-muted-foreground text-lg mb-6">
                      {businessToEdit ? "Edit your business or service details below." : "Add your business or service to help others find you. All fields marked with * are required."}
                    </p>
                    <AddBusinessForm businessData={businessToEdit || undefined} onSaved={handleBusinessSaved} />
                  </> : <BusinessesList onEdit={handleEditBusiness} refresh={refreshBusinessList} />}
              </div>
            </TabsContent>

            <TabsContent value="marketplace" className="space-y-6">
              <div className="bg-white rounded-xl shadow-md border border-border p-8 w-full">
                <UserMarketplaceListings />
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <div className="bg-white rounded-xl shadow-md border border-border p-8 w-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Settings className="h-6 w-6 mr-2 text-primary" />
                    <h2 className="text-2xl font-semibold">Preferences</h2>
                  </div>
                </div>
                
                <div className="max-w-4xl space-y-8">
                  <div className="flex items-center justify-between p-6 bg-muted rounded-lg border border-border/60">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Moon className="h-5 w-5 mr-2 text-primary" />
                        <h3 className="text-lg font-medium">Dark Mode</h3>
                      </div>
                      <p className="text-base text-muted-foreground">Use dark theme throughout the app</p>
                    </div>
                    <Switch checked={darkMode} onCheckedChange={setDarkMode} className="scale-125" />
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Notifications</h3>
                    
                    <div className="flex items-center justify-between p-6 bg-muted rounded-lg border border-border/60">
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium">Email Notifications</h3>
                        <p className="text-base text-muted-foreground">Receive email updates about your activity</p>
                      </div>
                      <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} className="scale-125" />
                    </div>
                    
                    <div className="flex items-center justify-between p-6 bg-muted rounded-lg border border-border/60">
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium">Push Notifications</h3>
                        <p className="text-base text-muted-foreground">Receive push notifications on your device</p>
                      </div>
                      <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} className="scale-125" />
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Privacy Settings</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-6 bg-muted rounded-lg border border-border/60">
                        <div className="space-y-1">
                          <h3 className="text-lg font-medium">Location Services</h3>
                          <p className="text-base text-muted-foreground">Allow the app to access your location</p>
                        </div>
                        <Switch id="location-services" checked={locationServices} onCheckedChange={checked => setLocationServices(checked as boolean)} className="scale-125" />
                      </div>
                      
                      <div className="flex items-center justify-between p-6 bg-muted rounded-lg border border-border/60">
                        <div className="space-y-1">
                          <h3 className="text-lg font-medium">Data Sharing</h3>
                          <p className="text-base text-muted-foreground">Share usage data to improve service</p>
                        </div>
                        <Switch id="data-sharing" checked={dataSharing} onCheckedChange={checked => setDataSharing(checked as boolean)} className="scale-125" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </MainLayout>;
};
export default Profile;