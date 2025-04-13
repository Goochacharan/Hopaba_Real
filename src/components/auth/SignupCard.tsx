
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { SocialLoginButtons } from './SocialLoginButtons';
import { useAuth } from '@/hooks/useAuth';
import { SignupForm, SignupFormValues } from './SignupForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RateLimitAlert } from './RateLimitAlert';
import { Link } from 'react-router-dom';

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
  const { loginWithSocial, socialLoading, signupWithEmail } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("social");
  
  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    loginWithSocial(provider);
  };

  const handleEmailSignup = (values: SignupFormValues) => {
    if (values.password !== values.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure both password fields match.",
        variant: "destructive"
      });
      return;
    }

    signupWithEmail(values.email, values.password, "New User", captchaToken || undefined);
  };

  // Captcha site key - replace with your actual site key if needed
  const captchaSiteKey = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // Test key

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>
          Sign up to get started with Hopaba
        </CardDescription>
      </CardHeader>
      
      <RateLimitAlert isVisible={isRateLimited} />
      
      <CardContent className="space-y-4">
        <Tabs defaultValue="social" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="social">Social Signup</TabsTrigger>
            <TabsTrigger value="email">Email Signup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="social" className="mt-4">
            <SocialLoginButtons 
              onSocialLogin={handleSocialLogin}
              isDisabled={isRateLimited}
              isLoading={socialLoading}
              buttonText="Sign up with"
            />
          </TabsContent>
          
          <TabsContent value="email" className="mt-4">
            <SignupForm
              onSubmit={handleEmailSignup}
              isLoading={isLoading}
              isDisabled={isRateLimited}
              captchaToken={captchaToken}
              captchaSiteKey={captchaSiteKey}
              onCaptchaVerify={handleCaptchaVerify}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <p className="text-sm text-center text-gray-500">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </CardFooter>
    </Card>
  );
};
