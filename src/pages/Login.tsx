
import React from 'react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import SocialLoginButtons from '@/components/SocialLoginButtons';
import EmailLoginForm, { LoginFormValues } from '@/components/EmailLoginForm';
import { Button } from '@/components/ui/button';

export default function Login() {
  const { 
    isLoading, 
    socialLoading, 
    loginError, 
    loginWithEmail, 
    loginWithSocial,
    getTestCredentials
  } = useAuth();
  
  const handleEmailSubmit = (values: LoginFormValues) => {
    loginWithEmail(values.email, values.password);
  };

  const handleDemoLogin = () => {
    const { email, password } = getTestCredentials();
    loginWithEmail(email, password);
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto space-y-6 py-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Log In</h1>
          <p className="text-muted-foreground">Enter your credentials to access your account</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          {/* Social Login Buttons */}
          <SocialLoginButtons 
            onSocialLogin={loginWithSocial}
            isLoading={isLoading}
            socialLoading={socialLoading}
          />
          
          <div className="relative">
            <Separator className="my-4" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white px-2 text-xs text-muted-foreground">or continue with email</span>
            </div>
          </div>

          {/* Login Error Display */}
          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {loginError}
            </div>
          )}

          {/* Email Login Form */}
          <EmailLoginForm 
            onSubmit={handleEmailSubmit}
            isLoading={isLoading}
          />

          {/* Demo Login Button */}
          <div className="mt-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Use Demo Account"}
            </Button>
            <p className="text-xs text-center mt-2 text-muted-foreground">
              Click to sign in with demo credentials (email: demo@example.com)
            </p>
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
      </div>
    </MainLayout>
  );
}
