
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Award, Gem, Star } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  isMustVisit: z.boolean().default(false),
  isHiddenGem: z.boolean().default(false)
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  onSubmit: (values: ReviewFormValues) => void;
  onCancel: () => void;
  locationName?: string;
}

const ReviewForm = ({
  onSubmit,
  onCancel,
  locationName
}: ReviewFormProps) => {
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      isMustVisit: false,
      isHiddenGem: false
    }
  });

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating);
    form.setValue("rating", rating);
  };

  return <div className="mb-6 p-4 bg-secondary/30 rounded-lg px-[9px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {locationName && <div className="text-sm font-medium text-muted-foreground mb-2">
              Reviewing: {locationName}
            </div>}
          
          <div className="space-y-2">
            <FormLabel>Your rating</FormLabel>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(rating => <button key={rating} type="button" onClick={() => handleRatingSelect(rating)} className="focus:outline-none">
                  <Star className={`w-6 h-6 ${rating <= selectedRating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />
                </button>)}
              {form.formState.errors.rating && <p className="text-destructive text-xs ml-2">Please select a rating</p>}
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <FormField control={form.control} name="isMustVisit" render={({
            field
          }) => <FormItem className="flex-1">
                  <Toggle pressed={field.value} onPressedChange={field.onChange} className={`w-full h-12 gap-2 ${field.value ? 'bg-green-500 text-white border-green-600 shadow-[0_4px_0px_0px_rgba(22,163,74,0.5)]' : ''}`}>
                    <Award className={`h-5 w-5 ${field.value ? 'text-white' : ''}`} />
                    <span className="font-medium">Must Visit</span>
                  </Toggle>
                </FormItem>} />
            
            <FormField control={form.control} name="isHiddenGem" render={({
            field
          }) => <FormItem className="flex-1">
                  <Toggle pressed={field.value} onPressedChange={field.onChange} className={`w-full h-12 gap-2 ${field.value ? 'bg-purple-500 text-white border-purple-600 shadow-[0_4px_0px_0px_rgba(147,51,234,0.5)]' : ''}`}>
                    <Gem className={`h-5 w-5 ${field.value ? 'text-white' : ''}`} />
                    <span className="font-medium">Hidden Gem</span>
                  </Toggle>
                </FormItem>} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Submit review
            </Button>
          </div>
        </form>
      </Form>
    </div>;
};

export default ReviewForm;

