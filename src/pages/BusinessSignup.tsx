
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const businessSignupSchema = z.object({
  business_name: z.string().min(2, "Business name must be at least 2 characters"),
  category: z.string().min(2, "Category is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  area: z.string().min(2, "Area is required"),
  contact_phone: z.string().min(10, "Valid phone number is required"),
  contact_email: z.string().email("Please enter a valid email address"),
  website: z.string().optional(),
  price_range_min: z.coerce.number().optional(),
  price_range_max: z.coerce.number().optional(),
  experience: z.string().optional(),
});

type BusinessSignupFormValues = z.infer<typeof businessSignupSchema>;

export default function BusinessSignup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<BusinessSignupFormValues>({
    resolver: zodResolver(businessSignupSchema),
    defaultValues: {
      business_name: "",
      category: "",
      description: "",
      address: "",
      city: "",
      area: "",
      contact_phone: "",
      contact_email: "",
      website: "",
      price_range_min: undefined,
      price_range_max: undefined,
      experience: "",
    },
  });

  const onSubmit = async (values: BusinessSignupFormValues) => {
    setIsLoading(true);
    try {
      // First check if user is logged in
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        // If not logged in, show error
        toast({
          title: "Authentication required",
          description: "Please log in before listing your business",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      // Insert business data
      const { error } = await supabase.from('service_providers').insert({
        name: values.business_name,
        category: values.category,
        description: values.description,
        address: values.address,
        city: values.city,
        area: values.area,
        contact_phone: values.contact_phone,
        contact_email: values.contact_email,
        website: values.website || null,
        price_range_min: values.price_range_min || null,
        price_range_max: values.price_range_max || null,
        experience: values.experience || null,
        user_id: sessionData.session.user.id,
      });

      if (error) throw error;

      toast({
        title: "Business registered successfully",
        description: "Your business has been listed on Hopaba",
      });
      
      navigate('/business-dashboard');
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const categoryOptions = [
    "restaurant",
    "cafe",
    "salon",
    "education",
    "fitness",
    "healthcare",
    "retail",
    "repair",
    "housekeeping",
    "technology",
    "legal",
    "transportation",
    "entertainment",
    "other"
  ];

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6 py-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">List Your Business</h1>
          <p className="text-muted-foreground">Create a profile for your business on Hopaba</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Please provide details about your business to get listed on our platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="business_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Business Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="" disabled>Select a category</option>
                          {categoryOptions.map((category) => (
                            <option key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell customers about your business" 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Street Address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area</FormLabel>
                        <FormControl>
                          <Input placeholder="Area/Locality" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Business Phone Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Business Email" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://yourbusiness.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price_range_min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Price (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Min Price" type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="price_range_max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Price (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Max Price" type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Years of experience or specialization" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Registering..." : "Register Business"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
