import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    grecaptcha: any;
    onloadCallback: () => void;
  }
}

interface CaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
}

export function Captcha({ siteKey, onVerify }: CaptchaProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const isScriptLoaded = useRef(false);

  useEffect(() => {
    // Skip if reCAPTCHA is already loaded
    if (window.grecaptcha && window.grecaptcha.render && divRef.current && !isScriptLoaded.current) {
      renderCaptcha();
      isScriptLoaded.current = true;
      return;
    }

    // Load the reCAPTCHA script if not already loaded
    if (!document.querySelector('#recaptcha-script') && !window.grecaptcha) {
      window.onloadCallback = () => {
        renderCaptcha();
        isScriptLoaded.current = true;
      };

      const script = document.createElement('script');
      script.id = 'recaptcha-script';
      script.src = `https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit`;
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
    if (divRef.current && window.grecaptcha && window.grecaptcha.render) {
      try {
        window.grecaptcha.render(divRef.current, {
          sitekey: siteKey,
          callback: onVerify,
        });
      } catch (error) {
        console.error('reCAPTCHA already rendered in this element', error);
      }
    }
  };

  return <div ref={divRef} className="g-recaptcha mt-4"></div>;
}
