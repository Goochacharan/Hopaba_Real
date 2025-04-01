
import React from 'react';
import BasicInfoSection from '../business-form/BasicInfoSection';
import LocationSection from '../business-form/LocationSection';
import ContactSection from '../business-form/ContactSection';
import { 
  PriceRangeSection, 
  AvailabilitySection, 
  TagsSection, 
  LanguagesSection, 
  ExperienceSection 
} from './BusinessFormSections';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface BusinessFormContentProps {
  isSubmitting: boolean;
  onCancel?: () => void;
  business?: any;
}

const BusinessFormContent: React.FC<BusinessFormContentProps> = ({
  isSubmitting,
  onCancel,
  business
}) => {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Basic Information Section with taller textarea for descriptions */}
        <div className="space-y-6">
          <BasicInfoSection />
          <Separator />
          <PriceRangeSection />
          <Separator />
          <AvailabilitySection />
        </div>
        
        {/* Location and Contact Section */}
        <div className="space-y-6">
          <LocationSection />
          <Separator />
          <ContactSection />
          <Separator />
          <TagsSection />
          <Separator />
          <LanguagesSection />
          <Separator />
          <ExperienceSection />
        </div>
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
