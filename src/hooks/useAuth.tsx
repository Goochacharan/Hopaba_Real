
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
  signupWithEmail: (email: string, password: string, name: string) => Promise<void>;
  getTestCredentials: () => { email: string; password: string };
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      
      if (data?.user) {
        setUser(data.user);
      }
      
      if (error) {
        console.error('Error fetching user:', error);
      }
    };

    getUser();

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    setLoginError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setLoginError(error.message);
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (data?.user) {
        setUser(data.user);
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in."
        });
      }
    } catch (error: any) {
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
        setLoginError(error.message);
        toast({
          title: "Social login failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
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

  const signupWithEmail = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setLoginError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        },
      });
      
      if (error) {
        setLoginError(error.message);
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
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
        logout 
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
