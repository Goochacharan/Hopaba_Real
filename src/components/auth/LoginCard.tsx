
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RateLimitAlert } from './RateLimitAlert';
import { OtpVerification } from './OtpVerification';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Phone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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
  handleCaptchaVerify,
}) => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);

  const handlePhoneLogin = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setPhoneLoading(true);
    try {
      // Format phone number for international format if needed
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

      // Call our edge function to send OTP with MSG91
      const { data, error } = await supabase.functions.invoke('msg91-otp', {
        body: {
          phone: formattedPhone,
          action: 'send'
        }
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || 'Failed to send OTP');
      }

      toast({
        title: "OTP Sent",
        description: "We've sent a verification code to your phone",
      });
      
      setShowOtpVerification(true);
    } catch (error) {
      console.error('Phone login error:', error);
      toast({
        title: "Failed to send OTP",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleOtpVerified = async () => {
    // In a real app, you would verify with your backend and create a session
    toast({
      title: "Phone verified",
      description: "You've been successfully logged in",
    });
    
    // Reset UI
    setShowOtpVerification(false);
  };

  const cancelPhoneVerification = () => {
    setShowOtpVerification(false);
  };

  if (showOtpVerification) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
        <OtpVerification 
          phone={phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`}
          onVerified={handleOtpVerified}
          onCancel={cancelPhoneVerification}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
      <RateLimitAlert isVisible={isRateLimited} />
      
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-medium">Log in with Phone</h3>
          <p className="text-sm text-muted-foreground mt-1">
            We'll send you a one-time verification code
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91 or your 10-digit number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={phoneLoading}
            />
            <p className="text-xs text-muted-foreground">
              If using an Indian number, you can enter 10 digits without the country code
            </p>
          </div>
          
          <Button 
            className="w-full" 
            onClick={handlePhoneLogin}
            disabled={phoneLoading || isRateLimited}
          >
            {phoneLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending OTP
              </>
            ) : (
              "Send Verification Code"
            )}
          </Button>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
