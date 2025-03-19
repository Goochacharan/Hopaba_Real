import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { useToast } from '@/hooks/use-toast';
import AddBusinessForm from '@/components/AddBusinessForm';
import BusinessesList from '@/components/BusinessesList';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  UserCog, 
  Save, 
  Settings, 
  Moon,
  LogOut,
  Plus,
  Store,
  ListPlus,
  Car 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BusinessFormValues } from '@/components/AddBusinessForm';

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }).optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Current password is required when setting a new password.",
  path: ["currentPassword"],
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const defaultValues: Partial<ProfileFormValues> = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
};

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  const [businessToEdit, setBusinessToEdit] = useState<(BusinessFormValues & { id: string }) | null>(null);
  const [refreshBusinessList, setRefreshBusinessList] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  function onSubmit(data: ProfileFormValues) {
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    });
    console.log(data);
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been signed out",
      });
      navigate('/');
    }
  };

  const handleEditBusiness = (business: BusinessFormValues & { id: string }) => {
    setBusinessToEdit(business);
    setShowAddForm(true);
    setActiveTab("carshops");
  };

  const handleAddNewCarListing = () => {
    const newShopTemplate: BusinessFormValues & { id: string } = {
      id: 'new',
      name: '',
      category: 'Cars',
      price_range_min: 0,
      price_range_max: 0,
      price_unit: 'fixed',
      availability: '',
      description: '',
      address: '',
      city: '',
      area: '',
      contact_phone: '',
      shop_name: '',
      shop_type: 'car_dealership',
      vehicle_make: '',
      vehicle_model: '',
    };
    
    setBusinessToEdit(newShopTemplate);
    setShowAddForm(true);
  };

  const handleBusinessSaved = () => {
    setShowAddForm(false);
    setBusinessToEdit(null);
    setRefreshBusinessList(!refreshBusinessList);
    toast({
      title: "Success",
      description: "Your car listing has been saved successfully.",
    });
  };

  return (
    <MainLayout>
      <section className="py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-medium mb-2">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings and car shop listings
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="account" className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="carshops" className="flex items-center gap-1.5">
              <Car className="h-4 w-4" />
              Car Listings
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-1.5">
              <Settings className="h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <UserCog className="h-5 w-5 mr-2" />
                  <h2 className="text-xl font-medium">Personal Information</h2>
                </div>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Your phone number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Used for verification and important notifications
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Password</h3>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Current password" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="New password" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Confirm new password" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </form>
              </Form>
            </div>
          </TabsContent>

          <TabsContent value="carshops" className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Store className="h-5 w-5 mr-2" />
                  <h2 className="text-xl font-medium">
                    {showAddForm 
                      ? businessToEdit?.id !== 'new'
                        ? "Edit Car Listing" 
                        : "Add New Car Listing"
                      : "Your Car Listings"
                    }
                  </h2>
                </div>
                {!showAddForm && (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={handleAddNewCarListing}
                    className="flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    Add Car Listing
                  </Button>
                )}
                {showAddForm && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setShowAddForm(false);
                      setBusinessToEdit(null);
                    }}
                  >
                    Back to List
                  </Button>
                )}
              </div>
              
              {showAddForm ? (
                <>
                  <p className="text-muted-foreground mb-4">
                    {businessToEdit?.id !== 'new'
                      ? "Edit your car listing details below." 
                      : "Add your car listing to your dealership. All fields marked with * are required."
                    }
                  </p>
                  <AddBusinessForm 
                    businessData={businessToEdit || undefined} 
                    onSaved={handleBusinessSaved}
                  />
                </>
              ) : (
                <BusinessesList 
                  onEdit={handleEditBusiness} 
                  refresh={refreshBusinessList}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  <h2 className="text-xl font-medium">Preferences</h2>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center">
                      <Moon className="h-4 w-4 mr-2" />
                      <h3 className="font-medium">Dark Mode</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Use dark theme throughout the app</p>
                  </div>
                  <Switch 
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-muted-foreground">Receive email updates about your activity</p>
                  </div>
                  <Switch 
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-medium">Push Notifications</h3>
                    <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                  </div>
                  <Switch 
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium">Privacy Settings</h3>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="location-services" 
                      checked={locationServices}
                      onCheckedChange={(checked) => setLocationServices(checked as boolean)}
                    />
                    <label
                      htmlFor="location-services"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Enable location services
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="data-sharing" 
                      checked={dataSharing}
                      onCheckedChange={(checked) => setDataSharing(checked as boolean)}
                    />
                    <label
                      htmlFor="data-sharing"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Share usage data to improve service
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </MainLayout>
  );
};

export default Profile;
