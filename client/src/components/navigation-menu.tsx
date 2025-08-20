import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MenuIcon, XIcon } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useState, useEffect } from "react";

interface NavigationMenuProps {
  currentPath?: string;
}

export function NavigationMenu({ currentPath = "/" }: NavigationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu when clicking outside or on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleClickOutside = (e: Event) => {
      const target = e.target as Element;
      if (!target.closest('[data-menu-container]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [currentPath]);

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", description: "View AI predictions and analytics" },
    { path: "/about", label: "About", description: "Learn about our platform and methodology" },
    { path: "/faq", label: "FAQ", description: "Frequently asked questions" },
    { path: "/blog", label: "Blog", description: "Insights and market analysis" },
    { path: "/policy", label: "Policy", description: "Terms and privacy policy" },
  ];

  const isActive = (path: string) => currentPath === path;

  return (
    <div className="relative" data-menu-container>
      {/* Menu Toggle Button */}
      <div className="flex items-center space-x-2">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 hover:bg-muted/80 transition-colors"
          data-testid="menu-toggle"
        >
          <div className="relative w-6 h-6">
            <MenuIcon 
              className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                isOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
              }`} 
            />
            <XIcon 
              className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                isOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
              }`} 
            />
          </div>
        </Button>
      </div>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Menu Panel */}
      <div
        className={`fixed top-16 right-4 z-50 w-80 bg-background border border-border/50 rounded-xl shadow-2xl transition-all duration-300 ease-out ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
        }`}
      >
        {/* Menu Header */}
        <div className="p-6 border-b border-border/30">
          <div className="flex items-center space-x-3">
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-foreground"></div>
            <span className="font-medium text-foreground">AIForecast Hub</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Navigate to different sections
          </p>
        </div>

        {/* Menu Items */}
        <div className="p-2">
          {menuItems.map((item, index) => (
            <Link key={item.path} href={item.path}>
              <div
                className={`group relative p-4 rounded-lg transition-all duration-200 hover:bg-muted/60 cursor-pointer ${
                  isActive(item.path) 
                    ? 'bg-muted/80 border border-border/30' 
                    : 'hover:translate-x-1'
                }`}
                style={{
                  animationDelay: isOpen ? `${index * 50}ms` : '0ms'
                }}
                data-testid={`menu-item-${item.path.replace('/', '')}`}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className={`font-medium transition-colors ${
                      isActive(item.path) 
                        ? 'text-foreground' 
                        : 'text-foreground group-hover:text-foreground'
                    }`}>
                      {item.label}
                    </div>
                    <div className="text-xs text-muted-foreground group-hover:text-muted-foreground/80">
                      {item.description}
                    </div>
                  </div>
                  {isActive(item.path) && (
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  )}
                </div>

                {/* Hover indicator */}
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full transition-all duration-200 ${
                  isActive(item.path) 
                    ? 'opacity-100' 
                    : 'opacity-0 group-hover:opacity-60'
                }`}></div>
              </div>
            </Link>
          ))}
        </div>

        {/* Menu Footer */}
        <div className="p-6 border-t border-border/30">
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              © 2025 AIForecast Hub
            </p>
            <p className="text-xs text-muted-foreground/70">
              Loremt ApS CVR-nr 41691360
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}