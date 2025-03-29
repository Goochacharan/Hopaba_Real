
import React from 'react';
import { Captcha } from '@/components/ui/captcha';

interface CaptchaVerificationProps {
  siteKey: string;
  onVerify: (token: string) => void;
}

export const CaptchaVerification: React.FC<CaptchaVerificationProps> = ({
  siteKey,
  onVerify,
}) => {
  return (
    <div className="mt-4">
      <p className="text-sm text-muted-foreground mb-2">Please complete the CAPTCHA verification:</p>
      <Captcha siteKey={siteKey} onVerify={onVerify} />
    </div>
  );
};
