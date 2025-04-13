
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { SocialLoginButtons } from './SocialLoginButtons';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm, LoginFormValues } from './LoginForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RateLimitAlert } from './RateLimitAlert';
import { Link } from 'react-router-dom';

interface LoginCardProps {
  isRateLimited: boolean;
  captchaToken: string | null;
  isLoading: boolean;
  handleCaptchaVerify: (token: string) => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({
  isRateLimited,
  captchaToken,
  isLoading,
  handleCaptchaVerify
}) => {
  const { toast } = useToast();
  const { loginWithSocial, socialLoading, loginWithEmail } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("social");
  
  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    loginWithSocial(provider);
  };

  const handleEmailLogin = (values: LoginFormValues) => {
    loginWithEmail(values.email, values.password, captchaToken || undefined);
  };

  // Captcha site key - replace with your actual site key if needed
  const captchaSiteKey = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // Test key

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to continue to your account
        </CardDescription>
      </CardHeader>
      
      <RateLimitAlert isVisible={isRateLimited} />
      
      <CardContent className="space-y-4">
        <Tabs defaultValue="social" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="social">Social Login</TabsTrigger>
            <TabsTrigger value="email">Email Login</TabsTrigger>
          </TabsList>
          
          <TabsContent value="social" className="mt-4">
            <SocialLoginButtons 
              onSocialLogin={handleSocialLogin}
              isDisabled={isRateLimited}
              isLoading={socialLoading}
              buttonText="Sign in with"
            />
          </TabsContent>
          
          <TabsContent value="email" className="mt-4">
            <LoginForm
              onSubmit={handleEmailLogin}
              isLoading={isLoading}
              isDisabled={isRateLimited}
              captchaToken={captchaToken}
              captchaSiteKey={captchaSiteKey}
              onCaptchaVerify={handleCaptchaVerify}
              requireCaptcha={false}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <p className="text-sm text-center text-gray-500">
          Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link>
        </p>
      </CardFooter>
    </Card>
  );
};
