import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/components/MainLayout';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Facebook, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Captcha } from '@/components/ui/captcha';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const HCAPTCHA_SITE_KEY = 'fda043e0-8372-4d8a-b190-84a8fdee1528'; // Updated hCaptcha site key

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const { loginWithEmail, isRateLimited, authAttempts } = useAuth();
  
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/');
      }
    };
    
    checkUser();
  }, [navigate]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    if (isRateLimited) {
      toast({
        title: "Too many attempts",
        description: "For security reasons, please try again later.",
        variant: "destructive",
      });
      return;
    }

    if (!captchaToken) {
      toast({
        title: "CAPTCHA verification required",
        description: "Please complete the CAPTCHA verification.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await loginWithEmail(values.email, values.password, captchaToken);
      navigate('/');
    } catch (error: any) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    if (isRateLimited) {
      toast({
        title: "Too many attempts",
        description: "For security reasons, please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    if (!captchaToken) {
      toast({
        title: "CAPTCHA verification required",
        description: "Please complete the CAPTCHA verification.",
        variant: "destructive",
      });
      return;
    }
    
    setSocialLoading(provider);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: captchaToken ? {
            captchaToken
          } : undefined
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Something went wrong with social login",
        variant: "destructive",
      });
      console.error("Social login error:", error);
      setSocialLoading(null);
    }
  };

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto space-y-6 py-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Log In</h1>
          <p className="text-muted-foreground">Enter your credentials to access your account</p>
        </div>

        {isRateLimited && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access temporarily blocked</AlertTitle>
            <AlertDescription>
              Too many login attempts detected. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Please complete the CAPTCHA verification:</p>
            <Captcha siteKey={HCAPTCHA_SITE_KEY} onVerify={handleCaptchaVerify} />
          </div>
          
          <div className="space-y-2">
            <Button 
              type="button" 
              className="w-full flex items-center justify-center gap-2 bg-white text-black border border-gray-300 hover:bg-gray-50"
              onClick={() => handleSocialLogin('google')}
              disabled={!!socialLoading || isRateLimited || !captchaToken}
            >
              {socialLoading === 'google' ? (
                <span>Connecting...</span>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                    </g>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </Button>
            
            <Button 
              type="button" 
              className="w-full flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166FE5] text-white"
              onClick={() => handleSocialLogin('facebook')}
              disabled={!!socialLoading || isRateLimited || !captchaToken}
            >
              {socialLoading === 'facebook' ? (
                <span>Connecting...</span>
              ) : (
                <>
                  <Facebook className="h-4 w-4" />
                  <span>Continue with Facebook</span>
                </>
              )}
            </Button>
          </div>
          
          <div className="relative">
            <Separator className="my-4" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white px-2 text-xs text-muted-foreground">or continue with email</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your@email.com"
                        type="email"
                        autoComplete="email"
                        disabled={isLoading || isRateLimited}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        autoComplete="current-password"
                        disabled={isLoading || isRateLimited}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || isRateLimited || !captchaToken}
              >
                {isLoading ? "Logging in..." : "Log in with Email"}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
