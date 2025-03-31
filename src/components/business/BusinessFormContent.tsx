import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Business } from './BusinessForm';

interface BusinessFormContentProps {
  isSubmitting: boolean;
  onCancel?: () => void;
  business?: Business;
}

const BusinessFormContent: React.FC<BusinessFormContentProps> = ({
  isSubmitting,
  onCancel,
  business
}) => {
  const form = useFormContext();
  const [selectedDays, setSelectedDays] = useState<string[]>(
    business?.availability_days || []
  );

  const daysOfWeek = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' },
  ];

  // This is a helper function to handle the conversion
  const parseAvailabilityDays = (availabilityDays: string | string[] | undefined): string[] => {
    if (!availabilityDays) return [];
    
    if (Array.isArray(availabilityDays)) {
      return availabilityDays;
    }
    
    // If it's a string, try to parse it
    try {
      if (availabilityDays.startsWith('[') && availabilityDays.endsWith(']')) {
        return JSON.parse(availabilityDays);
      }
      // Handle comma-separated string
      return availabilityDays.split(',').map(day => day.trim());
    } catch (e) {
      console.error('Error parsing availability_days:', e);
      return [];
    }
  };

  const handleDayChange = (day: string, checked: boolean) => {
    let updatedDays;
    if (checked) {
      updatedDays = [...selectedDays, day];
    } else {
      updatedDays = selectedDays.filter(d => d !== day);
    }
    setSelectedDays(updatedDays);
    form.setValue('availability_days', updatedDays);
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Basic Information</h3>
          <p className="text-sm text-muted-foreground">
            Provide the basic details of your business.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter business name" {...field} />
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
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Beauty">Beauty</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your business" 
                  className="min-h-[120px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <div>
          <h3 className="text-lg font-medium">Location</h3>
          <p className="text-sm text-muted-foreground">
            Provide the location details of your business.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="area"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Area</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Indiranagar" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Bangalore" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Complete Address</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Full address" 
                  className="min-h-[80px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="map_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Google Maps Link (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://maps.google.com/..." 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Paste a link to your business on Google Maps
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <div>
          <h3 className="text-lg font-medium">Working Hours</h3>
          <p className="text-sm text-muted-foreground">
            Select the days and hours when your business is operational.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <FormLabel>Working Days</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {daysOfWeek.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={day.id} 
                    checked={selectedDays.includes(day.id)}
                    onCheckedChange={(checked) => 
                      handleDayChange(day.id, checked as boolean)
                    }
                  />
                  <label 
                    htmlFor={day.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {day.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="availability_start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opening Time</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="e.g., 9:00 AM" {...field} />
                  </FormControl>
                  <FormDescription>Format: 9:00 AM</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="availability_end_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Closing Time</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="e.g., 6:00 PM" {...field} />
                  </FormControl>
                  <FormDescription>Format: 6:00 PM</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium">Pricing</h3>
          <p className="text-sm text-muted-foreground">
            Provide pricing details of your business.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="price_range_min"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Price (₹)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    value={field.value || ''}
                  />
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
                <FormLabel>Maximum Price (₹)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="1000" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    value={field.value || ''}
                  />
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select price unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="per hour">per hour</SelectItem>
                    <SelectItem value="per day">per day</SelectItem>
                    <SelectItem value="per session">per session</SelectItem>
                    <SelectItem value="per month">per month</SelectItem>
                    <SelectItem value="per person">per person</SelectItem>
                    <SelectItem value="per item">per item</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium">Contact Information</h3>
          <p className="text-sm text-muted-foreground">
            Provide contact details of your business.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="contact_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+91xxxxxxxxxx" {...field} />
                </FormControl>
                <FormDescription>
                  Format: +91 followed by 10 digits
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp Number</FormLabel>
                <FormControl>
                  <Input placeholder="+91xxxxxxxxxx" {...field} />
                </FormControl>
                <FormDescription>
                  Format: +91 followed by 10 digits
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="business@example.com" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="instagram"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram Link (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://instagram.com/yourbusiness" {...field} value={field.value || ""} />
              </FormControl>
              <FormDescription>
                Provide a link to your Instagram profile
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <div>
          <h3 className="text-lg font-medium">Services/Tags</h3>
          <p className="text-sm text-muted-foreground">
            Add tags to help customers find your business. Separate tags with commas.
          </p>
        </div>

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., pizza, delivery, vegan options"
                  className="min-h-[80px]"
                  value={field.value?.join(', ') || ''}
                  onChange={(e) => {
                    const tagValues = e.target.value
                      .split(',')
                      .map(tag => tag.trim())
                      .filter(tag => tag !== '');
                    field.onChange(tagValues);
                  }}
                />
              </FormControl>
              <FormDescription>
                Enter at least 3 tags describing your services or items
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex justify-end gap-4 mt-8">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : business?.id ? "Update Business" : "Submit Business"}
        </Button>
      </div>
    </>
  );
};

export default BusinessFormContent;
