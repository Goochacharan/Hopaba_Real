
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Initial session check
  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log("Checking for existing user session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          return;
        }
        
        if (data.session) {
          console.log("User already logged in, redirecting...");
          setIsAuthenticated(true);
          
          // Check if user is a business owner
          const { data: businessData, error: businessError } = await supabase
            .from('service_providers')
            .select('id')
            .eq('user_id', data.session.user.id);
          
          if (businessError) {
            console.error("Business data error:", businessError);
            navigate('/');
            return;
          }
          
          if (businessData && businessData.length > 0) {
            navigate('/business-dashboard');
          } else {
            navigate('/');
          }
        }
      } catch (error) {
        console.error("Error checking user session:", error);
      }
    };
    
    checkUser();
  }, [navigate]);
  
  // Auth state change listener
  useEffect(() => {
    console.log("Setting up auth state change listener");
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true);
          
          // Show success toast
          toast({
            title: "Login successful",
            description: "Welcome back!",
          });
          
          try {
            // Check if user is a business owner
            const { data: businessData, error: businessError } = await supabase
              .from('service_providers')
              .select('id')
              .eq('user_id', session.user.id);
            
            if (businessError) {
              console.error("Business data error:", businessError);
              navigate('/');
              return;
            }
            
            if (businessData && businessData.length > 0) {
              navigate('/business-dashboard');
            } else {
              navigate('/');
            }
          } catch (error) {
            console.error("Error checking business data:", error);
            navigate('/');
          }
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          navigate('/');
        }
      }
    );
    
    return () => {
      // Clean up subscription when component unmounts
      console.log("Cleaning up auth listener");
      authListener?.subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    setLoginError(null);
    
    try {
      console.log("Attempting login with:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      console.log("Login successful, user:", data.user?.id);
      // Navigation is handled by the auth state change listener
      
    } catch (error: any) {
      console.error("Login error details:", error);
      setLoginError(error.message);
      toast({
        title: "Login failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithSocial = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
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
      setSocialLoading(null);
    }
  };
  
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
        throw error;
      }
      setIsAuthenticated(false);
      navigate('/');
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        title: "Error signing out",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return {
    isLoading,
    socialLoading,
    loginError,
    isAuthenticated,
    loginWithEmail,
    loginWithSocial,
    signOut,
    setLoginError
  };
}
