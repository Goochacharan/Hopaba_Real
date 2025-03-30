
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StarRating from './StarRating';
import { UserCircle, Mail } from 'lucide-react';

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
    <Card className="shadow-md w-full overflow-hidden">
      <CardHeader className="pb-4 px-8 md:px-8 bg-muted/30">
        <CardTitle className="text-2xl font-bold">Seller Profile</CardTitle>
      </CardHeader>
      <CardContent className="px-6 md:px-8 py-5">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarFallback className="bg-primary/10 text-primary text-4xl">
              {getInitials(sellerName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-4 text-center md:text-left w-full">
            <h3 className="text-3xl font-bold">{sellerName}</h3>
            
            <div className="flex items-center gap-1">
              <StarRating rating={sellerRating} size="medium" />
              <span className="text-muted-foreground ml-1">
                {reviewCount > 0 ? `(${reviewCount} reviews)` : '(No reviews yet)'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-y-3 pt-1">
              <div className="flex items-center gap-2 text-base">
                <UserCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <span>Member since {formattedJoinedDate}</span>
              </div>
              
              <div className="flex items-center gap-2 text-base">
                <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <span>Contact via Message</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerProfileCard;
