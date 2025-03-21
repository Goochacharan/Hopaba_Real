import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AnimatedLogo from './AnimatedLogo';
import { cn } from '@/lib/utils';
import { Home, User, ListChecks, Calendar, ShoppingCart } from 'lucide-react';
import SearchBar from './SearchBar';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  const {
    toast
  } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getCurrentUser = async () => {
      setLoading(true);
      const {
        data
      } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setLoading(false);
    };
    getCurrentUser();
    const {
      data: authListener
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);
  const onSearch = (query: string) => {
    console.log("MainLayout search triggered with:", query);
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };
  const navigateToHome = () => {
    navigate('/');
    window.scrollTo(0, 0);
    console.log("Navigating to home page from: ", location.pathname);
  };
  return <div className="min-h-screen w-full bg-background flex flex-col items-center">
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
      
      <main className="px-0 py-0 mx-0">
        {children}
      </main>
      
      <div className="fixed bottom-16 left-0 right-0 px-4 z-50">
        <div className="max-w-5xl mx-auto">
          <SearchBar onSearch={onSearch} className="mb-0" placeholder="What are you looking for today?" initialValue="" currentRoute={location.pathname} />
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/50 py-2 px-4 z-50">
        <div className="max-w-5xl mx-auto flex justify-around">
          <NavButton to="/" icon={<Home className="h-6 w-6" />} label="Home" isActive={location.pathname === '/'} />
          
          <NavButton to="/marketplace" icon={<ShoppingCart className="h-6 w-6" />} label="Market" isActive={location.pathname === '/marketplace'} />
          
          <NavButton to="/events" icon={<Calendar className="h-6 w-6" />} label="Events" isActive={location.pathname === '/events'} />
          
          <NavButton to="/my-list" icon={<ListChecks className="h-6 w-6" />} label="My List" isActive={location.pathname === '/my-list'} />
          
          <NavButton to={user ? "/profile" : "/login"} icon={<User className="h-6 w-6" />} label={user ? "Profile" : "Login"} isActive={location.pathname === '/profile' || location.pathname === '/login'} />
        </div>
      </div>
    </div>;
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
  return <Link to={to} className={cn("flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-colors", isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50")} aria-label={label}>
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </Link>;
};
export default MainLayout;