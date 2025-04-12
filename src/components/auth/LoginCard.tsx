import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { OtpVerification } from './OtpVerification';
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
  const {
    toast
  } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const handlePhoneLogin = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid number",
        variant: "destructive"
      });
      return;
    }
    setPhoneLoading(true);
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const {
        data,
        error
      } = await supabase.functions.invoke('msg91-otp', {
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
        <OtpVerification phone={phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`} onVerified={handleOtpVerified} onCancel={cancelPhoneVerification} />
      </div>;
  }
  return <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4 my-[140px]">
      <div className="space-y-4">
        <Input type="tel" placeholder="Phone number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} disabled={phoneLoading} />
        
        <Button className="w-full" onClick={handlePhoneLogin} disabled={phoneLoading || isRateLimited}>
          {phoneLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending</> : "Send Verification"}
        </Button>
      </div>
    </div>;
};