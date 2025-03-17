
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, Calendar, Users, Star, Clock, Edit, Plus, Trash2 } from 'lucide-react';

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/login');
        toast({
          title: "Authentication required",
          description: "Please log in to access your dashboard",
          variant: "destructive",
        });
      } else {
        fetchBusinessInfo(data.session.user.id);
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const fetchBusinessInfo = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching business info:", error);
        // If no business found, might be a new user
        if (error.code === 'PGRST116') {
          setBusinessInfo(null);
        } else {
          toast({
            title: "Error",
            description: "Failed to load business information",
            variant: "destructive",
          });
        }
      } else {
        setBusinessInfo(data);
      }
    } catch (error) {
      console.error("Exception fetching business info:", error);
    } finally {
      setLoading(false);
    }
  };

  // Example data for a salon business dashboard
  const sampleStats = {
    customers: 128,
    appointments: 42,
    rating: 4.8,
    reviews: 65,
    recentBookings: [
      { id: 1, customer: "Ananya Sharma", service: "Haircut & Styling", time: "Today, 2:30 PM", status: "Confirmed" },
      { id: 2, customer: "Priya Patel", service: "Manicure & Pedicure", time: "Today, 4:00 PM", status: "Confirmed" },
      { id: 3, customer: "Raj Malhotra", service: "Beard Trim", time: "Tomorrow, 11:00 AM", status: "Pending" },
      { id: 4, customer: "Meera Iyer", service: "Hair Coloring", time: "Tomorrow, 3:00 PM", status: "Confirmed" },
    ],
    popularServices: [
      { name: "Haircut & Styling", bookings: 42 },
      { name: "Hair Coloring", bookings: 28 },
      { name: "Manicure & Pedicure", bookings: 23 },
      { name: "Facial", bookings: 18 }
    ]
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your business information...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!businessInfo) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto py-12 text-center">
          <div className="mb-6">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-4">No Business Profile Found</h1>
          <p className="text-muted-foreground mb-6">
            You haven't registered your business on Hopaba yet.
          </p>
          <Button onClick={() => navigate('/business-signup')}>
            Register Your Business
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{businessInfo.name}</h1>
            <p className="text-muted-foreground capitalize">{businessInfo.category}</p>
          </div>
          <Button onClick={() => navigate('/edit-business')}>
            <Edit className="mr-2 h-4 w-4" /> Edit Business
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Customers</p>
                  <p className="text-3xl font-bold">{sampleStats.customers}</p>
                </div>
                <Users className="h-8 w-8 text-primary/80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Appointments</p>
                  <p className="text-3xl font-bold">{sampleStats.appointments}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary/80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Rating</p>
                  <p className="text-3xl font-bold">{sampleStats.rating}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Reviews</p>
                  <p className="text-3xl font-bold">{sampleStats.reviews}</p>
                </div>
                <Star className="h-8 w-8 text-primary/80" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Business Info Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                <p>{businessInfo.address}, {businessInfo.area}, {businessInfo.city}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Contact</h3>
                <p>{businessInfo.contact_phone}</p>
                <p>{businessInfo.contact_email}</p>
              </div>
              {businessInfo.website && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Website</h3>
                  <p className="text-primary">{businessInfo.website}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Price Range</h3>
                <p>₹{businessInfo.price_range_min || 0} - ₹{businessInfo.price_range_max || 0}</p>
              </div>
              {businessInfo.experience && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Experience</h3>
                  <p>{businessInfo.experience}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Appointments Card */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Appointments</CardTitle>
                <CardDescription>Manage your upcoming appointments</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add New
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleStats.recentBookings.map(booking => (
                  <div key={booking.id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-medium">{booking.customer}</p>
                      <p className="text-sm text-muted-foreground">{booking.service}</p>
                    </div>
                    <div className="text-right">
                      <p className="flex items-center text-sm">
                        <Clock className="h-3 w-3 mr-1" /> {booking.time}
                      </p>
                      <p className={`text-xs ${booking.status === 'Confirmed' ? 'text-green-600' : 'text-orange-500'}`}>
                        {booking.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
