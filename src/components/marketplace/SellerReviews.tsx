import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import StarRating from './StarRating';
import { SellerReview } from '@/hooks/useSellerDetails';
import { format } from 'date-fns';
import { Star, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface SellerReviewsProps {
  sellerId: string;
  sellerName: string;
  reviews: SellerReview[];
  onAddReview?: (review: { rating: number; comment: string }) => Promise<void>;
  isSubmitting?: boolean;
}

const SellerReviews: React.FC<SellerReviewsProps> = ({
  sellerId,
  sellerName,
  reviews,
  onAddReview,
  isSubmitting = false
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast({
        title: 'Please add a comment',
        description: 'Your review needs to include a comment',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (onAddReview) {
        await onAddReview({ rating, comment });
      }
      
      setComment('');
      setRating(5);
      setDialogOpen(false);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleReviewButtonClick = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to write a review",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    setDialogOpen(true);
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Reviews & Ratings</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Button size="sm" onClick={handleReviewButtonClick}>
            {!user ? (
              <>
                <LogIn className="h-4 w-4 mr-2" />
                Login to Review
              </>
            ) : (
              "Write a Review"
            )}
          </Button>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Review {sellerName}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Your rating</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className="focus:outline-none"
                      onClick={() => handleRatingChange(value)}
                    >
                      <Star
                        className={`h-8 w-8 ${
                          value <= rating
                            ? 'fill-amber-500 stroke-amber-500'
                            : 'stroke-amber-500'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Your review</p>
                <Textarea
                  placeholder="Share your experience with this seller..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="positive">Positive</TabsTrigger>
            <TabsTrigger value="negative">Critical</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} showCount={false} />
                        <span className="font-medium">{review.reviewer_name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(review.created_at), 'PPP')}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-6">No reviews yet. Be the first to review this seller!</p>
            )}
          </TabsContent>
          
          <TabsContent value="positive" className="space-y-4">
            {reviews.filter(review => review.rating >= 4).length > 0 ? (
              reviews
                .filter(review => review.rating >= 4)
                .map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <StarRating rating={review.rating} showCount={false} />
                          <span className="font-medium">{review.reviewer_name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(review.created_at), 'PPP')}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm">{review.comment}</p>
                  </div>
                ))
            ) : (
              <p className="text-center text-muted-foreground py-6">No positive reviews yet</p>
            )}
          </TabsContent>
          
          <TabsContent value="negative" className="space-y-4">
            {reviews.filter(review => review.rating < 4).length > 0 ? (
              reviews
                .filter(review => review.rating < 4)
                .map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <StarRating rating={review.rating} showCount={false} />
                          <span className="font-medium">{review.reviewer_name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(review.created_at), 'PPP')}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm">{review.comment}</p>
                  </div>
                ))
            ) : (
              <p className="text-center text-muted-foreground py-6">No critical reviews yet</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SellerReviews;
