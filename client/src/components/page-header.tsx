import { Link } from "wouter";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NavigationMenu } from "./navigation-menu";
import { ThemeToggle } from "./theme-toggle";

interface PageHeaderProps {
  currentPath?: string;
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode; // For search results dropdown or other custom content
}


export function PageHeader({ 
  currentPath = "/", 
  showSearch = false,
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  children
}: PageHeaderProps) {

  return (
    <header className="sticky top-0 w-full z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Floating Pill Navigation */}
        <div className="flex justify-center">
          <div className="bg-background/80 backdrop-blur-xl border border-border/20 rounded-full px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-10">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-foreground"></div>
                <span className="text-base font-semibold text-foreground">AIForecast Hub</span>
              </Link>
              
              {/* Search functionality for dashboard */}
              {showSearch && onSearchChange && (
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 pr-4 py-2 w-48 sm:w-56 md:w-64 bg-background/60 dark:bg-white/10 border-border/50 dark:border-white/20 focus:border-border/80 dark:focus:border-white/30 placeholder:text-muted-foreground text-sm rounded-full transition-all duration-200 focus:scale-105"
                    data-testid="input-search-commodities"
                  />
                  {children}
                </div>
              )}
              
              {/* Right side actions */}
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <NavigationMenu currentPath={currentPath} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}