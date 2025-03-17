
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AnimatedLogo from './AnimatedLogo';
import { cn } from '@/lib/utils';
import { Home, User, ListChecks, Calendar, LogIn } from 'lucide-react';
import SearchBar from './SearchBar';
import useRecommendations from '@/hooks/useRecommendations';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleSearch, query } = useRecommendations();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const getCurrentUser = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setLoading(false);
    };
    
    getCurrentUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
      }
    );
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);
  
  const onSearch = (query: string) => {
    console.log("MainLayout search triggered with:", query);
    handleSearch(query);
    if (location.pathname !== '/') {
      navigate('/');
    }
  };
  
  // Force scroll to top when search is performed
  useEffect(() => {
    if (query) {
      window.scrollTo(0, 0);
    }
  }, [query]);
  
  const navigateToHome = () => {
    navigate('/');
    window.scrollTo(0, 0);
  };

  // We're removing the handleLogout function since we're moving it to the Profile page
  
  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center">
      <header className="w-full sticky top-0 z-50 glass border-b border-border/50 px-6 py-4">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={navigateToHome}
            role="button"
            aria-label="Go to home page"
          >
            <AnimatedLogo size="sm" />
            <h1 className="text-xl font-medium tracking-tight">Hopaba</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-all-200">About</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-all-200">Explore</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-all-200">Help</a>
            </nav>
            
            {user ? (
              // We'll remove the sign out button from here
              null
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button size="sm" onClick={() => navigate('/signup')}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className={cn("w-full flex-1 max-w-5xl mx-auto px-4 md:px-6 py-8 mb-36", className)}>
        {children}
      </main>
      
      {/* Fixed Search Bar above the navigation */}
      <div className="fixed bottom-20 left-0 right-0 px-4 z-50">
        <div className="max-w-5xl mx-auto">
          <SearchBar 
            onSearch={onSearch} 
            className="mb-0" 
            placeholder="What are you looking for today?"
            initialValue={query}
          />
        </div>
      </div>
      
      {/* Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/50 py-2 px-4 z-50">
        <div className="max-w-5xl mx-auto flex justify-around">
          <NavButton 
            to="/" 
            icon={<Home className="h-5 w-5" />} 
            label="Home" 
            isActive={location.pathname === '/'} 
          />
          
          <NavButton 
            to="/my-list" 
            icon={<ListChecks className="h-5 w-5" />} 
            label="My List" 
            isActive={location.pathname === '/my-list'} 
          />
          
          <NavButton 
            to="/events" 
            icon={<Calendar className="h-5 w-5" />} 
            label="Events" 
            isActive={location.pathname === '/events'} 
          />
          
          <NavButton 
            to={user ? "/profile" : "/login"} 
            icon={<User className="h-5 w-5" />} 
            label={user ? "Profile" : "Login"} 
            isActive={location.pathname === '/profile' || location.pathname === '/login'} 
          />
        </div>
      </div>
      
      <footer className="w-full py-6 px-6 border-t border-border/50 mb-36">
        <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <AnimatedLogo size="sm" />
            <span className="text-sm text-muted-foreground">Hopaba</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Natural language recommendations, simplified.
          </div>
        </div>
      </footer>
    </div>
  );
};

interface NavButtonProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ to, icon, label, isActive }) => {
  return (
    <Link 
      to={to}
      className={cn(
        "flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-colors",
        isActive 
          ? "text-foreground" 
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
      )}
      aria-label={label}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Link>
  );
};

export default MainLayout;
