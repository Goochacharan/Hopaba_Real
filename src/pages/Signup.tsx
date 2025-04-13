
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/components/MainLayout';
import { SignupCard } from '@/components/auth/SignupCard';
import { useAuth } from '@/hooks/useAuth';

export default function Signup() {
  const navigate = useNavigate();
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null);
  const { isRateLimited, isLoading } = useAuth();
  
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
        <SignupCard 
          isRateLimited={isRateLimited}
          captchaToken={captchaToken}
          isLoading={isLoading}
          handleCaptchaVerify={handleCaptchaVerify}
        />
      </div>
    </MainLayout>
  );
}
