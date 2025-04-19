
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/components/MainLayout';
import { LoginCard } from '@/components/auth/LoginCard';
import { LoginFormValues } from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';

const HCAPTCHA_SITE_KEY = 'fda043e0-8372-4d8a-b190-84a8fdee1528';
const REQUIRE_CAPTCHA = false;

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const { loginWithEmail, isRateLimited, authAttempts } = useAuth();
  
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/');
      }
    };
    
    checkUser();
  }, [navigate]);

  const onSubmit = async (values: LoginFormValues) => {
    if (isRateLimited) {
      toast({
        title: "Too many attempts",
        description: "For security reasons, please try again later.",
        variant: "destructive",
      });
      return;
    }

    if (REQUIRE_CAPTCHA && !captchaToken) {
      toast({
        title: "CAPTCHA verification required",
        description: "Please complete the CAPTCHA verification.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await loginWithEmail(values.email, values.password, REQUIRE_CAPTCHA ? captchaToken : undefined);
      navigate('/');
    } catch (error: any) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google') => {
    if (isRateLimited) {
      toast({
        title: "Too many attempts",
        description: "For security reasons, please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    setSocialLoading(provider);
    try {
      // Using redirectTo with current origin to ensure proper redirect after authentication
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: REQUIRE_CAPTCHA && captchaToken ? {
            captchaToken
          } : undefined
        },
      });

      if (error) {
        throw error;
      }
      
      // No need to navigate here as OAuth will redirect
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Something went wrong with social login",
        variant: "destructive",
      });
      console.error("Social login error:", error);
      setSocialLoading(null);
    }
  };

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto space-y-6 py-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Log In</h1>
          <p className="text-muted-foreground">Enter your credentials to access your account</p>
        </div>

        <LoginCard 
          isRateLimited={isRateLimited}
          socialLoading={socialLoading}
          captchaToken={captchaToken}
          captchaSiteKey={HCAPTCHA_SITE_KEY}
          isLoading={isLoading}
          handleSocialLogin={handleSocialLogin}
          handleCaptchaVerify={handleCaptchaVerify}
          onSubmit={onSubmit}
          requireCaptcha={REQUIRE_CAPTCHA}
        />
      </div>
    </MainLayout>
  );
}
