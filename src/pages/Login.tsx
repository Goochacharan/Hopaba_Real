
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/components/MainLayout';
import { LoginCard } from '@/components/auth/LoginCard';
import { LoginFormValues } from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const { loginWithPhone, verifyOTP, isRateLimited, authAttempts } = useAuth();
  const [showOTPInput, setShowOTPInput] = useState(false);
  
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

    setIsLoading(true);
    
    // Use phone login instead of email login
    if (!showOTPInput) {
      try {
        await loginWithPhone(values.phone);
        setPhoneNumber(values.phone);
        setShowOTPInput(true);
        toast({
          title: "OTP Sent",
          description: "A verification code has been sent to your phone number.",
        });
      } catch (error: any) {
        toast({
          title: "Login failed",
          description: error.message || "Failed to send verification code",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        // Verify OTP
        await verifyOTP(phoneNumber, values.otp);
        navigate('/');
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
      } catch (error: any) {
        toast({
          title: "Verification failed",
          description: error.message || "Invalid verification code",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
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
          isLoading={isLoading}
          onSubmit={onSubmit}
          showOTPInput={showOTPInput}
          phoneNumber={phoneNumber}
        />
      </div>
    </MainLayout>
  );
}
