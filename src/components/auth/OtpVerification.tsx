
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface OtpVerificationProps {
  phone: string;
  onVerified: () => void;
  onCancel: () => void;
}

export const OtpVerification: React.FC<OtpVerificationProps> = ({ 
  phone, 
  onVerified,
  onCancel
}) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { toast } = useToast();

  const verifyOtp = async () => {
    if (otp.length !== 4) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 4-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Call our edge function to verify OTP with MSG91
      const { data, error } = await supabase.functions.invoke('msg91-otp', {
        body: {
          phone,
          action: 'verify',
          code: otp
        }
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || 'Failed to verify OTP');
      }

      toast({
        title: "OTP verified",
        description: "Phone number verified successfully",
      });
      
      onVerified();
    } catch (error) {
      console.error('OTP verification error:', error);
      toast({
        title: "Verification failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setResendLoading(true);
    try {
      // Call our edge function to send OTP with MSG91
      const { data, error } = await supabase.functions.invoke('msg91-otp', {
        body: {
          phone,
          action: 'send'
        }
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || 'Failed to send OTP');
      }

      toast({
        title: "OTP sent",
        description: "A new OTP has been sent to your phone",
      });
    } catch (error) {
      console.error('OTP sending error:', error);
      toast({
        title: "Failed to send OTP",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium">Verify your phone number</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Enter the 4-digit code sent to {phone}
        </p>
      </div>
      
      <div className="flex justify-center mb-6">
        <InputOTP 
          maxLength={4} 
          value={otp} 
          onChange={setOtp}
          disabled={loading}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button
        className="w-full"
        onClick={verifyOtp}
        disabled={otp.length !== 4 || loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying
          </>
        ) : (
          "Verify OTP"
        )}
      </Button>
      
      <div className="flex justify-between items-center mt-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onCancel}
          disabled={loading || resendLoading}
        >
          Cancel
        </Button>
        
        <Button 
          variant="link" 
          size="sm"
          onClick={resendOtp}
          disabled={loading || resendLoading}
        >
          {resendLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending
            </>
          ) : (
            "Resend OTP"
          )}
        </Button>
      </div>
    </div>
  );
};
