
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import AnimatedLogo from './AnimatedLogo';
import { cn } from '@/lib/utils';
import { Home, Search, User, Map, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center">
      <header className="w-full sticky top-0 z-50 glass border-b border-border/50 px-6 py-4">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AnimatedLogo size="sm" />
            <h1 className="text-xl font-medium tracking-tight">Locale</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-all-200">About</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-all-200">Explore</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-all-200">Help</a>
          </nav>
        </div>
      </header>
      
      <main className={cn("w-full flex-1 max-w-5xl mx-auto px-4 md:px-6 py-8", className)}>
        {children}
      </main>
      
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/50 py-2 px-4 z-50">
        <div className="max-w-5xl mx-auto flex justify-around">
          <NavButton 
            to="/" 
            icon={<Home className="h-5 w-5" />} 
            label="Home" 
            isActive={location.pathname === '/'} 
          />
          
          <NavButton 
            to="/" 
            icon={<Search className="h-5 w-5" />} 
            label="Search" 
            isActive={false} 
          />
          
          <NavButton 
            to="/map" 
            icon={<Map className="h-5 w-5" />} 
            label="Map" 
            isActive={location.pathname === '/map'} 
          />
          
          <NavButton 
            to="/profile" 
            icon={<User className="h-5 w-5" />} 
            label="Profile" 
            isActive={location.pathname === '/profile'} 
          />
          
          <NavButton 
            to="/settings" 
            icon={<Settings className="h-5 w-5" />} 
            label="Settings" 
            isActive={location.pathname === '/settings'} 
          />
        </div>
      </div>
      
      <footer className="w-full py-6 px-6 border-t border-border/50 mb-16">
        <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <AnimatedLogo size="sm" />
            <span className="text-sm text-muted-foreground">Locale</span>
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
