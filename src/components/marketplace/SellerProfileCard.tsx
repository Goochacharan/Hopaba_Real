
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StarRating from './StarRating';
import { UserCircle, Instagram, Mail, MapPin } from 'lucide-react';

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
      <CardHeader className="pb-2 px-6 md:px-6 bg-muted/30">
        <CardTitle className="text-xl font-bold">Seller Profile</CardTitle>
      </CardHeader>
      <CardContent className="px-5 md:px-6 py-4">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
          <Avatar className="h-24 w-24 border-4 border-background">
            <AvatarFallback className="bg-primary/10 text-primary text-3xl">
              {getInitials(sellerName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2 text-center md:text-left w-full">
            <h3 className="text-2xl font-bold">{sellerName}</h3>
            
            <div className="flex flex-wrap items-center">
              <StarRating 
                rating={sellerRating} 
                size="medium" 
                showCount={true}
                count={reviewCount}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-y-2 pt-1">
              <div className="flex items-center gap-2 text-sm">
                <UserCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>Member since {formattedJoinedDate}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>San Francisco, CA</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>Contact via Message</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Instagram className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>@{sellerName.toLowerCase().replace(/\s/g, '')}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerProfileCard;
