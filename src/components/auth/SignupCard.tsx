
import React from 'react';
import { Link } from 'react-router-dom';
import { SignupForm, SignupFormValues } from './SignupForm';
import { RateLimitAlert } from './RateLimitAlert';
import { Separator } from '@/components/ui/separator';

interface SignupCardProps {
  isRateLimited: boolean;
  isLoading: boolean;
  onSubmit: (values: SignupFormValues) => void;
  showOTPInput?: boolean;
  phoneNumber?: string;
}

export const SignupCard: React.FC<SignupCardProps> = ({
  isRateLimited,
  isLoading,
  onSubmit,
  showOTPInput = false,
  phoneNumber = '',
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
      <RateLimitAlert isVisible={isRateLimited} />

      <SignupForm 
        onSubmit={onSubmit}
        isLoading={isLoading}
        isDisabled={isRateLimited}
        showOTPInput={showOTPInput}
        phoneNumber={phoneNumber}
      />

      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};
