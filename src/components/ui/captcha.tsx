
import React, { useEffect, useRef } from 'react';

// Use the type definition from global.d.ts
interface CaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
}

export function Captcha({ siteKey, onVerify }: CaptchaProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const isScriptLoaded = useRef(false);

  useEffect(() => {
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
      script.src = `https://js.hcaptcha.com/1/api.js?onload=onloadCallback&render=explicit`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    return () => {
      // Clean up the global callback when component unmounts
      // but keep the script for potential reuse
      window.onloadCallback = () => {};
    };
  }, [siteKey]);

  const renderCaptcha = () => {
    if (divRef.current && window.hcaptcha && window.hcaptcha.render) {
      try {
        window.hcaptcha.render(divRef.current, {
          sitekey: siteKey,
          callback: onVerify,
        });
      } catch (error) {
        console.error('hCaptcha already rendered in this element', error);
      }
    }
  };

  return <div ref={divRef} className="h-captcha mt-4"></div>;
}
