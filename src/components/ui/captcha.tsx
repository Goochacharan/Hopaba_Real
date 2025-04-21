
import React, { useEffect, useRef } from 'react';

// Use the type definition from global.d.ts
interface CaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
}

export function Captcha({ siteKey, onVerify }: CaptchaProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const isScriptLoaded = useRef(false);
  const widgetId = useRef<number | null>(null);

  useEffect(() => {
    // Add domain information to hCaptcha
    window.hcaptcha = window.hcaptcha || {};
    
    // Skip if hCaptcha is already loaded
    if (window.hcaptcha && divRef.current && !isScriptLoaded.current) {
      renderCaptcha();
      isScriptLoaded.current = true;
      return;
    }

    // Load the hCaptcha script if not already loaded
    if (!document.querySelector('#hcaptcha-script') && !window.hcaptcha) {
      window.onloadCallback = () => {
        renderCaptcha();
        isScriptLoaded.current = true;
      };

      const script = document.createElement('script');
      script.id = 'hcaptcha-script';
      script.src = `https://js.hcaptcha.com/1/api.js?onload=onloadCallback&render=explicit&host=hopaba.in`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    return () => {
      // Clean up the global callback when component unmounts
      // but keep the script for potential reuse
      window.onloadCallback = () => {};
      
      // Reset the captcha when component unmounts
      if (window.hcaptcha && widgetId.current !== null) {
        try {
          window.hcaptcha.reset(widgetId.current);
        } catch (error) {
          console.error('Error resetting hCaptcha:', error);
        }
      }
    };
  }, [siteKey]);

  const renderCaptcha = () => {
    if (divRef.current && window.hcaptcha && window.hcaptcha.render) {
      try {
        // Try to reset first if already rendered
        if (widgetId.current !== null) {
          window.hcaptcha.reset(widgetId.current);
        } else {
          widgetId.current = window.hcaptcha.render(divRef.current, {
            sitekey: siteKey,
            callback: onVerify,
            'host-url': 'hopaba.in'
          });
        }
      } catch (error) {
        console.error('hCaptcha rendering error:', error);
      }
    }
  };

  // Add a debugging message to help troubleshoot
  console.log('Rendering hCaptcha with site key:', siteKey, 'for domain: hopaba.in');

  return <div ref={divRef} className="h-captcha mt-4"></div>;
}
