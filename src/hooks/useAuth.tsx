
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  isLoading: boolean;
  socialLoading: boolean;
  user: any | null;
  loginError: string | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithSocial: (provider: 'google' | 'facebook') => Promise<void>;
  signupWithEmail: (email: string, password: string, name: string, captchaToken?: string) => Promise<void>;
  getTestCredentials: () => { email: string; password: string };
  logout: () => Promise<void>;
  isAdmin: boolean;
  adminLoading: boolean;
  authAttempts: number;
  setAuthAttempts: (attempts: number) => void;
  isRateLimited: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Rate limiting constants
const MAX_AUTH_ATTEMPTS = 5;
const RATE_LIMIT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [authAttempts, setAuthAttempts] = useState<number>(0);
  const [isRateLimited, setIsRateLimited] = useState<boolean>(false);
  const [rateLimitExpiry, setRateLimitExpiry] = useState<number | null>(null);
  const { toast } = useToast();

  // Check if user is rate limited from localStorage on initial load
  useEffect(() => {
    const storedAttempts = localStorage.getItem('auth_attempts');
    const storedExpiryTime = localStorage.getItem('rate_limit_expiry');
    
    if (storedAttempts) {
      setAuthAttempts(parseInt(storedAttempts));
    }
    
    if (storedExpiryTime) {
      const expiryTime = parseInt(storedExpiryTime);
      const now = Date.now();
      
      if (now < expiryTime) {
        setIsRateLimited(true);
        setRateLimitExpiry(expiryTime);
        
        // Set timeout to remove rate limit when it expires
        const timeoutDuration = expiryTime - now;
        setTimeout(() => {
          setIsRateLimited(false);
          setAuthAttempts(0);
          localStorage.removeItem('auth_attempts');
          localStorage.removeItem('rate_limit_expiry');
        }, timeoutDuration);
      } else {
        // Clear expired rate limit data
        localStorage.removeItem('auth_attempts');
        localStorage.removeItem('rate_limit_expiry');
      }
    }
  }, []);

  // Update localStorage when attempts change
  useEffect(() => {
    if (authAttempts > 0) {
      localStorage.setItem('auth_attempts', authAttempts.toString());
    }
    
    // Apply rate limiting if max attempts reached
    if (authAttempts >= MAX_AUTH_ATTEMPTS && !isRateLimited) {
      const expiryTime = Date.now() + RATE_LIMIT_DURATION;
      setIsRateLimited(true);
      setRateLimitExpiry(expiryTime);
      localStorage.setItem('rate_limit_expiry', expiryTime.toString());
      
      toast({
        title: "Too many attempts",
        description: "For security reasons, please try again after 15 minutes.",
        variant: "destructive",
      });
      
      // Set timeout to remove rate limit
      setTimeout(() => {
        setIsRateLimited(false);
        setAuthAttempts(0);
        localStorage.removeItem('auth_attempts');
        localStorage.removeItem('rate_limit_expiry');
      }, RATE_LIMIT_DURATION);
    }
  }, [authAttempts, toast]);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      
      if (data?.user) {
        setUser(data.user);
        checkAdminStatus(data.user.id);
      }
      
      if (error) {
        console.error('Error fetching user:', error);
      }
    };

    getUser();

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        checkAdminStatus(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const checkAdminStatus = async (userId: string) => {
    setAdminLoading(true);
    try {
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data);
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
      setIsAdmin(false);
    } finally {
      setAdminLoading(false);
    }
  };

  const incrementAuthAttempts = () => {
    if (!isRateLimited) {
      setAuthAttempts(prevAttempts => prevAttempts + 1);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    if (isRateLimited) {
      toast({
        title: "Access temporarily blocked",
        description: "Too many login attempts. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setLoginError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        incrementAuthAttempts();
        setLoginError(error.message);
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (data?.user) {
        // Reset auth attempts on successful login
        setAuthAttempts(0);
        localStorage.removeItem('auth_attempts');
        
        setUser(data.user);
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in."
        });
      }
    } catch (error: any) {
      incrementAuthAttempts();
      setLoginError(error.message);
      toast({
        title: "Login error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithSocial = async (provider: 'google' | 'facebook') => {
    if (isRateLimited) {
      toast({
        title: "Access temporarily blocked",
        description: "Too many login attempts. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    setSocialLoading(true);
    setLoginError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/profile`,
        },
      });
      
      if (error) {
        incrementAuthAttempts();
        setLoginError(error.message);
        toast({
          title: "Social login failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      incrementAuthAttempts();
      setLoginError(error.message);
      toast({
        title: "Social login error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSocialLoading(false);
    }
  };

  const signupWithEmail = async (email: string, password: string, name: string, captchaToken?: string) => {
    if (isRateLimited) {
      toast({
        title: "Access temporarily blocked",
        description: "Too many signup attempts. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setLoginError(null);
    
    try {
      // Include the captcha token in the signup metadata if provided
      const options = {
        data: {
          full_name: name,
        },
        captchaToken
      };
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options
      });
      
      if (error) {
        incrementAuthAttempts();
        setLoginError(error.message);
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Reset auth attempts on successful signup
        setAuthAttempts(0);
        localStorage.removeItem('auth_attempts');
        
        if (data.user && !data.session) {
          toast({
            title: "Email verification required",
            description: "Please check your email for a verification link before logging in.",
          });
        } else if (data.user) {
          setUser(data.user);
          toast({
            title: "Account created",
            description: "Your account has been created successfully!"
          });
        }
      }
    } catch (error: any) {
      incrementAuthAttempts();
      setLoginError(error.message);
      toast({
        title: "Signup error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setUser(null);
        toast({
          title: "Signed out",
          description: "You have been signed out successfully."
        });
      }
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTestCredentials = () => ({
    email: "demo@example.com",
    password: "demo1234"
  });

  return (
    <AuthContext.Provider 
      value={{ 
        isLoading, 
        socialLoading,
        user, 
        loginError, 
        loginWithEmail, 
        loginWithSocial,
        signupWithEmail,
        getTestCredentials,
        logout,
        isAdmin,
        adminLoading,
        authAttempts,
        setAuthAttempts,
        isRateLimited
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
