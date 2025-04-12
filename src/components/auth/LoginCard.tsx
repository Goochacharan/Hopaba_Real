
import React from 'react';
import { Link } from 'react-router-dom';
import { LoginForm, LoginFormValues } from './LoginForm';
import { RateLimitAlert } from './RateLimitAlert';
import { Separator } from '@/components/ui/separator';

interface LoginCardProps {
  isRateLimited: boolean;
  isLoading: boolean;
  onSubmit: (values: LoginFormValues) => void;
  showOTPInput?: boolean;
  phoneNumber?: string;
}

export const LoginCard: React.FC<LoginCardProps> = ({
  isRateLimited,
  isLoading,
  onSubmit,
  showOTPInput = false,
  phoneNumber = '',
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
      <RateLimitAlert isVisible={isRateLimited} />
      
      <LoginForm 
        onSubmit={onSubmit}
        isLoading={isLoading}
        isDisabled={isRateLimited}
        showOTPInput={showOTPInput}
        phoneNumber={phoneNumber}
      />

      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
