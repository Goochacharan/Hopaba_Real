
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { OtpVerification } from './OtpVerification';

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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);

  const handlePhoneSignup = async () => {
    // Validate phone number: exactly 10 digits
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    if (cleanedPhone.length !== 10) {
      toast({
        title: "Invalid number",
        description: "Please enter a 10-digit phone number",
        variant: "destructive"
      });
      return;
    }

    setPhoneLoading(true);
    try {
      const formattedPhone = `+91${cleanedPhone}`;
      const { data, error } = await supabase.functions.invoke('msg91-otp', {
        body: {
          phone: formattedPhone,
          action: 'send'
        }
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || 'Failed to send OTP');
      }
      setShowOtpVerification(true);
    } catch (error) {
      toast({
        title: "Send failed",
        description: "Unable to send OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleOtpVerified = () => {
    toast({
      title: "Verified"
    });
    setShowOtpVerification(false);
  };

  const cancelPhoneVerification = () => {
    setShowOtpVerification(false);
  };

  if (showOtpVerification) {
    return <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
      <OtpVerification 
        phone={`+91${phoneNumber.replace(/\D/g, '')}`} 
        onVerified={handleOtpVerified} 
        onCancel={cancelPhoneVerification} 
      />
    </div>;
  }

  return <div className="bg-white rounded-lg shadow-sm border p-6">
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="bg-gray-100 p-2 border border-r-0 rounded-l-md">
          <span className="text-gray-500">+91</span>
        </div>
        <Input 
          type="tel" 
          placeholder="10-digit mobile number" 
          value={phoneNumber} 
          onChange={e => {
            // Allow only digits
            const numericValue = e.target.value.replace(/\D/g, '');
            setPhoneNumber(numericValue.slice(0, 10));
          }}
          disabled={phoneLoading} 
          maxLength={10}
          className="rounded-l-none"
        />
      </div>
      
      <Button 
        className="w-full" 
        onClick={handlePhoneSignup} 
        disabled={phoneLoading || isRateLimited || phoneNumber.length !== 10}
      >
        {phoneLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending</> : "Send Verification"}
      </Button>
    </div>
  </div>;
};
