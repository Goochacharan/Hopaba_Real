import React from 'react';
import { useFormContext } from 'react-hook-form';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { 
  ListChecks, 
  Heading, 
  Clock, 
  FileText, 
  Star,
  StoreIcon,
  IndianRupee,
  User,
  Tag
} from 'lucide-react';
import { BusinessFormValues } from '../AddBusinessForm';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const categoryOptions = [
  "Actress",
  "Animator",
  "Art Director",
  "Bar",
  "Beauty & Wellness",
  "Cafe",
  "Child Care",
  "Cleaning Services",
  "Dance Class",
  "Dancer",
  "Director",
  "Electrical",
  "Event Planning",
  "Fashion Designer",
  "Filmmaker",
  "Financial Services",
  "Food Delivery",
  "Graphic Design",
  "Graphic Designer",
  "Gym",
  "Home Repairs",
  "Ice Cream Shop",
  "Illustrator",
  "Interior Designer",
  "Karate Class",
  "Landscaping",
  "Legal Services",
  "Makeup Artist",
  "MMA Class",
  "Model",
  "Music Class",
  "Musician",
  "Painter",
  "Personal Training",
  "Pet Care",
  "Photographer",
  "Photography",
  "Plumbing",
  "Producer",
  "Restaurant",
  "Restaurant & Bar",
  "Sculptor",
  "Singer",
  "Technology Support",
  "Transportation",
  "Tutoring",
  "Voice Artist",
  "Writer/Author",
  "Other"
];

const daysOfWeek = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

const timeSlots = [
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM",
  "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM"
];

const BasicInfoSection = () => {
  const form = useFormContext<BusinessFormValues>();
  const [tagInput, setTagInput] = React.useState('');
  
  const handleAddTag = () => {
    if (tagInput.trim() === '') return;
    
    const currentTags = form.getValues('tags') || [];
    if (!currentTags.includes(tagInput.trim())) {
      form.setValue('tags', [...currentTags, tagInput.trim()], { shouldValidate: true });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue(
      'tags', 
      currentTags.filter(tag => tag !== tagToRemove),
      { shouldValidate: true }
    );
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <>
      <div className="space-y-6 md:col-span-2">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <StoreIcon className="h-5 w-5 text-primary" />
          Basic Information
        </h3>
      </div>

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <div className="flex items-center gap-2">
                <Heading className="h-4 w-4" />
                Business/Service Name*
              </div>
            </FormLabel>
            <FormControl>
              <Input placeholder="Enter your business or service name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                Category*
              </div>
            </FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="md:col-span-2 grid grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="price_range_min"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  Min Price*
                </div>
              </FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price_range_max"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  Max Price*
                </div>
              </FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price_unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price Unit</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select price unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="per hour">Per Hour</SelectItem>
                  <SelectItem value="per day">Per Day</SelectItem>
                  <SelectItem value="per service">Per Service</SelectItem>
                  <SelectItem value="per month">Per Month</SelectItem>
                  <SelectItem value="per person">Per Person</SelectItem>
                  <SelectItem value="fixed price">Fixed Price</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="availability_days"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Available Days*
              </div>
            </FormLabel>
            <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
              {daysOfWeek.map((day) => (
                <FormItem
                  key={day.id}
                  className="flex flex-row items-center space-x-2 space-y-0 rounded-md border p-3"
                >
                  <FormControl>
                    <Checkbox
                      checked={field.value?.includes(day.id)}
                      onCheckedChange={(checked) => {
                        const currentValues = field.value || [];
                        const newValues = checked
                          ? [...currentValues, day.id]
                          : currentValues.filter((value) => value !== day.id);
                        field.onChange(newValues);
                      }}
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-normal">
                    {day.label}
                  </FormLabel>
                </FormItem>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
        <FormField
          control={form.control}
          name="availability_start_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Time*</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="availability_end_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Time*</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="experience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Experience
              </div>
            </FormLabel>
            <FormControl>
              <Input placeholder="e.g., 5 years of experience" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tags"
        rules={{
          validate: (value) => 
            (value && value.length >= 3) || 
            "Please add at least 3 popular items/services you offer"
        }}
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Popular Items/Services*
              </div>
            </FormLabel>
            <FormDescription>
              Add at least 3 popular items or services you offer (e.g., "Ice Cream", "Massage", "Pizza")
            </FormDescription>
            <div className="flex gap-2 mb-2">
              <FormControl>
                <Input
                  placeholder="Add a popular item or service..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
              </FormControl>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddTag}
                className="shrink-0"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {field.value?.map((tag, index) => (
                <Badge key={index} className="flex items-center gap-1 px-3 py-1.5 bg-primary/90">
                  {tag}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 rounded-full hover:bg-primary-foreground/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description*
              </div>
            </FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe your business or service..." 
                className="min-h-[120px]" 
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Provide details about your business or service (10-500 characters).
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BasicInfoSection;
