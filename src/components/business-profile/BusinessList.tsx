
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Settings } from 'lucide-react';
import { BusinessData } from './BusinessListingForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BusinessCard from '../BusinessCard';
import NoBusinessesMessage from './NoBusinessesMessage';
import LoadingSkeleton from './LoadingSkeleton';

interface BusinessListProps {
  onAddBusiness: () => void;
  onEditBusiness: (business: BusinessData) => void;
}

const BusinessList: React.FC<BusinessListProps> = ({ onAddBusiness, onEditBusiness }) => {
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
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
        
        // Convert availability field to array if needed for interface compatibility
        const formattedData = data.map(item => ({
          ...item,
          availability: Array.isArray(item.availability) ? item.availability : item.availability ? [item.availability] : []
        })) as BusinessData[];
        
        setBusinesses(formattedData);
      } catch (error) {
        console.error('Error fetching businesses:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBusinesses();
  }, [user]);

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
    return <LoadingSkeleton />;
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
            {filteredBusinesses.length === 0 ? (
              <NoBusinessesMessage status={tab as 'active' | 'pending' | 'rejected'} onAddBusiness={onAddBusiness} />
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

export default BusinessList;
