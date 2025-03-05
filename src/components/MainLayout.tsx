
import React from 'react';
import AnimatedLogo from './AnimatedLogo';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
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
      
      <footer className="w-full py-6 px-6 border-t border-border/50">
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
