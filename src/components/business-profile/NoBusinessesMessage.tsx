
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface NoBusinessesMessageProps {
  status: 'active' | 'pending' | 'rejected';
  onAddBusiness: () => void;
}

const NoBusinessesMessage: React.FC<NoBusinessesMessageProps> = ({ status, onAddBusiness }) => {
  let title = '';
  let message = '';
  
  switch (status) {
    case 'active':
      title = 'No Active Businesses';
      message = 'You don\'t have any approved business listings yet.';
      break;
    case 'pending':
      title = 'No Pending Businesses';
      message = 'You don\'t have any business listings waiting for approval.';
      break;
    case 'rejected':
      title = 'No Rejected Businesses';
      message = 'You don\'t have any rejected business listings.';
      break;
  }

  return (
    <div className="text-center py-12 space-y-4">
      <h3 className="text-xl font-medium text-gray-900">{title}</h3>
      <p className="text-gray-500">{message}</p>
      <Button onClick={onAddBusiness} className="mt-4">
        <Plus className="mr-2 h-4 w-4" />
        Add Business
      </Button>
    </div>
  );
};

export default NoBusinessesMessage;
