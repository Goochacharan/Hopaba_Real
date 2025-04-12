
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/components/MainLayout';
import { SignupCard } from '@/components/auth/SignupCard';
import { SignupFormValues } from '@/components/auth/SignupForm';
import { useAuth } from '@/hooks/useAuth';

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const { authAttempts, isRateLimited, signupWithPhone, verifyOTP } = useAuth();
  
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/');
      }
    };
    
    checkUser();
  }, [navigate]);

  const onSubmit = async (values: SignupFormValues) => {
    if (isRateLimited) {
      toast({
        title: "Too many attempts",
        description: "For security reasons, please try again later.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    if (!showOTPInput) {
      try {
        // Send OTP for signup
        await signupWithPhone(values.phone);
        setPhoneNumber(values.phone);
        setShowOTPInput(true);
        toast({
          title: "OTP Sent",
          description: "A verification code has been sent to your phone number.",
        });
      } catch (error: any) {
        toast({
          title: "Sign up failed",
          description: error.message || "Failed to send verification code",
          variant: "destructive",
        });
        console.error("Signup error:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        // Verify OTP for signup
        await verifyOTP(phoneNumber, values.otp, true);
        navigate('/');
        toast({
          title: "Account created",
          description: "Your account has been created successfully!",
        });
      } catch (error: any) {
        toast({
          title: "Verification failed",
          description: error.message || "Invalid verification code",
          variant: "destructive",
        });
        console.error("OTP verification error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto space-y-6 py-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground">Enter your phone number to create a new account</p>
        </div>

        <SignupCard 
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
