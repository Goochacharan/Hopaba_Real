
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import StarRating from './StarRating';
import { SellerReview } from '@/hooks/useSellerDetails';
import { format } from 'date-fns';
import { Star, LogIn, Edit, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SellerReviewsProps {
  sellerId: string;
  sellerName: string;
  reviews: SellerReview[];
  onAddReview?: (review: { rating: number; comment: string }) => Promise<void>;
  onEditReview?: (reviewId: string, review: { rating: number; comment: string }) => Promise<void>;
  onDeleteReview?: (reviewId: string) => Promise<void>;
  isSubmitting?: boolean;
}

const SellerReviews: React.FC<SellerReviewsProps> = ({
  sellerId,
  sellerName,
  reviews,
  onAddReview,
  onEditReview,
  onDeleteReview,
  isSubmitting = false
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentReviewId, setCurrentReviewId] = useState<string | null>(null);
  
  // Find the user's existing review
  const userReview = user ? reviews.find(review => review.reviewer_id === user.id) : null;

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (dialogOpen && userReview && editMode) {
      setRating(userReview.rating);
      setComment(userReview.comment);
    } else if (!dialogOpen) {
      setRating(5);
      setComment('');
      setEditMode(false);
      setCurrentReviewId(null);
    }
  }, [dialogOpen, userReview, editMode]);

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
      if (editMode && userReview && onEditReview) {
        await onEditReview(userReview.id, { rating, comment });
        toast({
          title: "Review updated",
          description: "Your review has been successfully updated",
        });
      } else if (onAddReview) {
        await onAddReview({ rating, comment });
        toast({
          title: "Review submitted",
          description: "Thank you for your feedback!",
        });
      }
      
      setComment('');
      setRating(5);
      setDialogOpen(false);
      setEditMode(false);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleDeleteReview = async () => {
    if (userReview && onDeleteReview) {
      try {
        await onDeleteReview(userReview.id);
        setDeleteDialogOpen(false);
        toast({
          title: "Review deleted",
          description: "Your review has been successfully deleted",
        });
      } catch (error: any) {
        toast({
          title: "Error deleting review",
          description: error.message || "There was an error deleting your review",
          variant: "destructive",
        });
      }
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
    
    // If user already has a review, open it in edit mode
    if (userReview) {
      setEditMode(true);
      setRating(userReview.rating);
      setComment(userReview.comment);
      setCurrentReviewId(userReview.id);
    } else {
      setEditMode(false);
      setRating(5);
      setComment('');
    }
    
    setDialogOpen(true);
  };

  // Render a review item
  const renderReviewItem = (review: SellerReview) => {
    const isUsersReview = user && review.reviewer_id === user.id;
    
    return (
      <div key={review.id} className="border-b pb-4 last:border-b-0">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} showCount={false} />
              <span className="font-medium">{review.reviewer_name}</span>
              {isUsersReview && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Your Review</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(review.created_at), 'PPP')}
            </p>
          </div>
          
          {isUsersReview && (
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => {
                  setEditMode(true);
                  setCurrentReviewId(review.id);
                  setRating(review.rating);
                  setComment(review.comment);
                  setDialogOpen(true);
                }}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit review</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" 
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete review</span>
              </Button>
            </div>
          )}
        </div>
        <p className="text-sm">{review.comment}</p>
      </div>
    );
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
            ) : userReview ? (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Your Review
              </>
            ) : (
              "Write a Review"
            )}
          </Button>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editMode ? "Edit your review" : `Review ${sellerName}`}</DialogTitle>
              <DialogDescription>
                {editMode 
                  ? "Update your review to better reflect your experience"
                  : "Share your experience with this seller to help others"}
              </DialogDescription>
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : editMode ? 'Update Review' : 'Submit Review'}
              </Button>
            </DialogFooter>
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
              reviews.map(renderReviewItem)
            ) : (
              <p className="text-center text-muted-foreground py-6">No reviews yet. Be the first to review this seller!</p>
            )}
          </TabsContent>
          
          <TabsContent value="positive" className="space-y-4">
            {reviews.filter(review => review.rating >= 4).length > 0 ? (
              reviews
                .filter(review => review.rating >= 4)
                .map(renderReviewItem)
            ) : (
              <p className="text-center text-muted-foreground py-6">No positive reviews yet</p>
            )}
          </TabsContent>
          
          <TabsContent value="negative" className="space-y-4">
            {reviews.filter(review => review.rating < 4).length > 0 ? (
              reviews
                .filter(review => review.rating < 4)
                .map(renderReviewItem)
            ) : (
              <p className="text-center text-muted-foreground py-6">No critical reviews yet</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReview} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default SellerReviews;
