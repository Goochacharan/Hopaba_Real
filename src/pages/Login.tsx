import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/components/MainLayout';
import { LoginCard } from '@/components/auth/LoginCard';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const { loginWithEmail, isRateLimited } = useAuth();
  
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/');
      }
    };
    
    checkUser();
  }, [navigate]);

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto space-y-6 py-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Log In</h1>
          <p className="text-muted-foreground">Enter your phone number to access your account</p>
        </div>

        <LoginCard 
          isRateLimited={isRateLimited}
          captchaToken={captchaToken}
          isLoading={isLoading}
          handleCaptchaVerify={handleCaptchaVerify}
        />
      </div>
    </MainLayout>
  );
}
