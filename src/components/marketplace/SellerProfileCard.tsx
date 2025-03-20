
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StarRating from './StarRating';
import { UserCircle } from 'lucide-react';

interface SellerProfileCardProps {
  sellerName: string;
  sellerRating: number;
  reviewCount: number;
  joinedDate?: string;
}

const SellerProfileCard: React.FC<SellerProfileCardProps> = ({
  sellerName,
  sellerRating,
  reviewCount,
  joinedDate
}) => {
  // Format joined date to show only month and year
  const formattedJoinedDate = joinedDate 
    ? new Date(joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className="shadow-md w-full">
      <CardHeader className="pb-4 px-8">
        <CardTitle className="text-2xl font-semibold">Seller Profile</CardTitle>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <div className="flex items-center space-x-6">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
              {getInitials(sellerName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-3">
            <h3 className="text-2xl font-medium">{sellerName}</h3>
            <div className="flex items-center">
              <StarRating rating={sellerRating} className="mr-3" showCount={false} />
              <span className="text-base text-muted-foreground">({reviewCount} reviews)</span>
            </div>
            <p className="text-base text-muted-foreground flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              Member since {formattedJoinedDate}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerProfileCard;
