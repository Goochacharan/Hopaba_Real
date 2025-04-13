
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SocialLoginButtons } from './SocialLoginButtons';
import { useAuth } from '@/hooks/useAuth';

interface SignupCardProps {
  isRateLimited: boolean;
  captchaToken: string | null;
  isLoading: boolean;
  handleCaptchaVerify: (token: string) => void;
}

export const SignupCard: React.FC<SignupCardProps> = ({
  isRateLimited,
  captchaToken,
  isLoading,
  handleCaptchaVerify
}) => {
  const { toast } = useToast();
  const { loginWithSocial, socialLoading } = useAuth();
  
  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    loginWithSocial(provider);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>
          Sign up to get started with Hopaba
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SocialLoginButtons 
          onSocialLogin={handleSocialLogin}
          isDisabled={isRateLimited}
          isLoading={socialLoading}
          buttonText="Sign up with"
        />
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Social Login Only
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
