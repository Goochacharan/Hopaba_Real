
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Settings } from 'lucide-react';
import { Business } from './BusinessFormSimple';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BusinessCard from '../BusinessCard';

interface BusinessListProps {
  onAddBusiness: () => void;
  onEditBusiness: (business: Business) => void;
  refresh?: boolean;
}

const BusinessListSimple: React.FC<BusinessListProps> = ({ onAddBusiness, onEditBusiness, refresh }) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBusinesses = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('service_providers')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        const formattedData = data.map(item => {
          // Convert availability to array
          const availability = Array.isArray(item.availability) 
            ? item.availability 
            : item.availability ? [item.availability] : [];
          
          // Convert availability_days to array if it's a string
          let availability_days;
          if (item.availability_days) {
            availability_days = typeof item.availability_days === 'string'
              ? item.availability_days.split(',').map((day: string) => day.trim())
              : item.availability_days;
          } else {
            availability_days = [];
          }
          
          return {
            ...item,
            availability,
            availability_days
          } as Business;
        });
        
        setBusinesses(formattedData);
      } catch (error) {
        console.error('Error fetching businesses:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBusinesses();
  }, [user, refresh]);

  const approvedBusinesses = businesses.filter(business => business.approval_status === 'approved');
  const pendingBusinesses = businesses.filter(business => business.approval_status === 'pending');
  const rejectedBusinesses = businesses.filter(business => business.approval_status === 'rejected');
  
  const getStatusFilteredBusinesses = () => {
    switch (activeTab) {
      case 'active':
        return approvedBusinesses;
      case 'pending':
        return pendingBusinesses;
      case 'rejected':
        return rejectedBusinesses;
      default:
        return businesses;
    }
  };
  
  const filteredBusinesses = getStatusFilteredBusinesses();

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-24 bg-gray-100 animate-pulse rounded-md"></div>
        ))}
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">You haven't listed any businesses yet</h3>
        <p className="text-muted-foreground mb-4">Add your first business to get started</p>
        <Button onClick={onAddBusiness}>
          <Plus className="mr-2 h-4 w-4" />
          Add Business
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Businesses</h2>
        <Button onClick={onAddBusiness}>
          <Plus className="mr-2 h-4 w-4" />
          Add Business
        </Button>
      </div>
      
      <Separator />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">
            Active ({approvedBusinesses.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingBusinesses.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedBusinesses.length})
          </TabsTrigger>
        </TabsList>
        
        {['active', 'pending', 'rejected'].map((tab) => (
          <TabsContent key={tab} value={tab} className="pt-4">
            {getStatusFilteredBusinesses().length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No {tab} businesses found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBusinesses.map((business) => (
                  <div key={business.id} className="relative">
                    <BusinessCard business={business} />
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-2 bg-white h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditBusiness(business);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default BusinessListSimple;
