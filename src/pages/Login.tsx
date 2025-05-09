
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/components/MainLayout';
import { LoginCard } from '@/components/auth/LoginCard';
import { LoginFormValues } from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';

const HCAPTCHA_SITE_KEY = 'fda043e0-8372-4d8a-b190-84a8fdee1528';
const REQUIRE_CAPTCHA = true;

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const { loginWithEmail, isRateLimited, authAttempts } = useAuth();
  
  useEffect(() => {
    const handleRedirectResponse = async () => {
      const hasHashParams = window.location.hash && window.location.hash.length > 1;
      
      if (hasHashParams) {
        setIsLoading(true);
        
        try {
          const { data, error } = await supabase.auth.getSession();
          
          console.log("Auth session after redirect:", data);
          
          if (error) {
            console.error("Auth redirect error:", error);
            toast({
              title: "Login failed",
              description: error.message || "Could not complete authentication",
              variant: "destructive",
            });
          } else if (data.session) {
            toast({
              title: "Login successful",
              description: "You've been signed in with Google",
            });
            window.location.hash = '';
            navigate('/');
          }
        } catch (err) {
          console.error("Error handling redirect:", err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    handleRedirectResponse();
    
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/');
      }
    };
    
    checkUser();
  }, [navigate, toast]);

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
      // Use the public URL from window.location.origin instead of hardcoded URL
      const redirectUrl = `${window.location.origin}/login`;
      
      console.log("Starting OAuth flow with redirect URL:", redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        throw error;
      }
      
      console.log("OAuth initiation response:", data);
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
