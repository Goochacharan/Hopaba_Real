
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
      <CardHeader className="pb-6 px-8 md:px-10 bg-muted/30">
        <CardTitle className="text-3xl font-bold">Seller Profile</CardTitle>
      </CardHeader>
      <CardContent className="px-6 md:px-10 py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
          <Avatar className="h-40 w-40 border-4 border-background">
            <AvatarFallback className="bg-primary/10 text-primary text-5xl">
              {getInitials(sellerName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-8 text-center md:text-left w-full">
            <h3 className="text-4xl font-bold">{sellerName}</h3>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center">
                <StarRating rating={sellerRating} className="mr-4" showCount={false} size="medium" />
                <span className="text-xl text-muted-foreground">({reviewCount} reviews)</span>
              </div>
              
              <span className="hidden md:block text-muted-foreground">•</span>
              
              <p className="text-xl text-muted-foreground flex items-center gap-3">
                <UserCircle className="h-6 w-6" />
                Member since {formattedJoinedDate}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 pt-4">
              <div className="flex items-center gap-3 text-xl">
                <MapPin className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                <span>San Francisco, CA</span>
              </div>
              
              <div className="flex items-center gap-3 text-xl">
                <Mail className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                <span>Contact via Message</span>
              </div>
              
              <div className="flex items-center gap-3 text-xl">
                <Instagram className="h-6 w-6 text-muted-foreground flex-shrink-0" />
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
