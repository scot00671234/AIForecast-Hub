import { useState } from "react";
import { Link } from "wouter";
import { SearchIcon, MenuIcon, XIcon, HomeIcon, BarChart3Icon, InfoIcon, HelpCircleIcon, FileTextIcon, ScrollIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NavigationMenu } from "./navigation-menu";
import { ThemeToggle } from "./theme-toggle";
import { motion, AnimatePresence } from "framer-motion";

interface PageHeaderProps {
  currentPath?: string;
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode; // For search results dropdown or other custom content
}

const menuItems = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3Icon },
  { href: "/about", label: "About", icon: InfoIcon },
  { href: "/faq", label: "FAQ", icon: HelpCircleIcon },
  { href: "/blog", label: "Blog", icon: FileTextIcon },
  { href: "/legal", label: "Legal", icon: ScrollIcon },
];

export function PageHeader({ 
  currentPath = "/", 
  showSearch = false,
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  children
}: PageHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 w-full z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Consistent across all pages */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-foreground"></div>
            <span className="text-lg font-semibold text-foreground">AIForecast Hub</span>
          </Link>
          
          {/* Right side content */}
          <div className="flex items-center space-x-4">
            {/* Search functionality for dashboard */}
            {showSearch && onSearchChange && (
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 pr-4 py-2 w-48 sm:w-56 md:w-64 bg-background/60 dark:bg-white/10 border-border/50 dark:border-white/20 focus:border-border/80 dark:focus:border-white/30 placeholder:text-muted-foreground min-h-[44px] transition-all duration-200 focus:scale-105"
                  data-testid="input-search-commodities"
                />
                {children}
              </div>
            )}
            
            {/* Theme toggle for dashboard */}
            {showSearch && <ThemeToggle />}
            
            {/* Theme toggle for non-dashboard pages */}
            {!showSearch && <ThemeToggle />}
            
            {/* Menu button for all pages */}
            <Button
              variant="ghost"
              size="icon"
              className=""
              onClick={() => setIsMobileMenuOpen(true)}
              data-testid="button-menu"
            >
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile slide-in menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl z-50"
          >
            {/* Menu header */}
            <div className="flex items-center justify-end p-4 border-b border-gray-200 dark:border-gray-700">
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMobileMenu}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <XIcon className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>

            {/* Menu items */}
            <div className="flex flex-col p-2 space-y-1">
              {menuItems.map((item, index) => {
                const IconComponent = item.icon;
                const isActive = currentPath === item.href;
                
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <Link href={item.href} onClick={closeMobileMenu}>
                      <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        isActive ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}>
                        <IconComponent className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Theme toggle in menu */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}