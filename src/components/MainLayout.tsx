
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AnimatedLogo from './AnimatedLogo';
import { cn } from '@/lib/utils';
import { Home, User, ListChecks, Calendar, ShoppingCart, LogIn } from 'lucide-react';
import SearchBar from './SearchBar';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/hooks/useAuth';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  className
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const getCurrentUser = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setLoading(false);
    };

    getCurrentUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const onSearch = (query: string) => {
    console.log("MainLayout search triggered with:", query);
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    if (query.trim()) {
      if (location.pathname === '/events') {
        navigate(`/events?q=${encodeURIComponent(query)}`);
      } else {
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  const navigateToHome = () => {
    navigate('/');
    window.scrollTo(0, 0);
    console.log("Navigating to home page from: ", location.pathname);
  };
  
  const shouldShowSearchBar = () => {
    return !['/location', '/search'].some(path => location.pathname.startsWith(path));
  };

  const navigateToLogin = () => {
    navigate('/login');
    setShowAuthDialog(false);
  };

  const navigateToSignup = () => {
    navigate('/signup');
    setShowAuthDialog(false);
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center relative">
      <header className="w-full sticky top-0 z-50 glass border-b border-border/50 px-6 py-4">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" role="button" aria-label="Go to home page" onClick={e => {
          e.preventDefault();
          navigateToHome();
        }}>
            <AnimatedLogo size="sm" />
            <h1 className="text-xl font-medium tracking-tight">
              Hopaba
            </h1>
          </Link>
          
          <div className="flex items-center gap-4">
            {!user && <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button size="sm" onClick={() => navigate('/signup')}>
                  Sign Up
                </Button>
              </div>}
          </div>
        </div>
      </header>
      
      <main className="w-full flex-1 overflow-y-auto pb-32">
        {children}
      </main>
      
      {shouldShowSearchBar() && (
        <div className="fixed bottom-12 left-0 right-0 px-4 z-[60]">
          <div className="max-w-5xl mx-auto">
            <SearchBar 
              onSearch={onSearch} 
              className="mb-0" 
              placeholder={location.pathname === '/events' ? "Search for events..." : "What are you looking for today?"} 
              initialValue="" 
              currentRoute={location.pathname} 
            />
          </div>
        </div>
      )}
      
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/50 py-1 px-4 z-[60]">
        <div className="max-w-5xl mx-auto flex justify-around">
          <NavButton to="/" icon={<Home className="h-5 w-5" />} label="Home" isActive={location.pathname === '/'} />
          
          <NavButton to="/marketplace" icon={<ShoppingCart className="h-5 w-5" />} label="Market" isActive={location.pathname === '/marketplace'} />
          
          <NavButton to="/events" icon={<Calendar className="h-5 w-5" />} label="Events" isActive={location.pathname === '/events'} />
          
          <NavButton to="/my-list" icon={<ListChecks className="h-5 w-5" />} label="My List" isActive={location.pathname === '/my-list'} />
          
          <NavButton to={user ? "/profile" : "/login"} icon={<User className="h-5 w-5" />} label={user ? "Profile" : "Login"} isActive={location.pathname === '/profile' || location.pathname === '/login'} />
        </div>
      </div>

      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Authentication Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to be logged in to search on Hopaba. Please login or sign up to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-between">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <div className="flex gap-2">
              <AlertDialogAction onClick={navigateToLogin} className="flex items-center gap-2 bg-primary">
                <LogIn className="h-4 w-4" />
                Login
              </AlertDialogAction>
              <AlertDialogAction onClick={navigateToSignup}>Sign Up</AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface NavButtonProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({
  to,
  icon,
  label,
  isActive
}) => {
  return (
    <Link to={to} className={cn("flex flex-col items-center gap-0.5 px-3 py-1 rounded-md transition-colors", isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50")} aria-label={label}>
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
};

export default MainLayout;
