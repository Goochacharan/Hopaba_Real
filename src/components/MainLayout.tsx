
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
          <Button 
            variant={location.pathname === '/' ? "default" : "ghost"} 
            size="icon" 
            asChild 
            className="flex flex-col items-center gap-1" 
            aria-label="Home"
          >
            <Link to="/">
              <Home className="h-5 w-5" />
              <span className="text-xs">Home</span>
            </Link>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            asChild 
            className="flex flex-col items-center gap-1" 
            aria-label="Search"
          >
            <Link to="/">
              <Search className="h-5 w-5" />
              <span className="text-xs">Search</span>
            </Link>
          </Button>
          
          <Button 
            variant={location.pathname === '/map' ? "default" : "ghost"} 
            size="icon" 
            asChild 
            className="flex flex-col items-center gap-1" 
            aria-label="Map"
          >
            <Link to="/map">
              <Map className="h-5 w-5" />
              <span className="text-xs">Map</span>
            </Link>
          </Button>
          
          <Button 
            variant={location.pathname === '/profile' ? "default" : "ghost"} 
            size="icon" 
            asChild 
            className="flex flex-col items-center gap-1" 
            aria-label="Profile"
          >
            <Link to="/profile">
              <User className="h-5 w-5" />
              <span className="text-xs">Profile</span>
            </Link>
          </Button>
          
          <Button 
            variant={location.pathname === '/settings' ? "default" : "ghost"} 
            size="icon" 
            asChild 
            className="flex flex-col items-center gap-1" 
            aria-label="Settings"
          >
            <Link to="/settings">
              <Settings className="h-5 w-5" />
              <span className="text-xs">Settings</span>
            </Link>
          </Button>
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

export default MainLayout;
