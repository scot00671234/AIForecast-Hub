import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLocation, Link } from "wouter";
import { ChevronRightIcon, BarChart3Icon, TrendingUpIcon, ZapIcon, MenuIcon } from "lucide-react";
import { ThemeToggle } from "../components/theme-toggle";

export default function Landing() {
  const [, navigate] = useLocation();

  const handleContinue = () => {
    navigate("/dashboard");
  };

  const features = [
    {
      icon: BarChart3Icon,
      title: "Real-time Tracking",
      description: "Live commodity price data from Yahoo Finance with comprehensive market coverage"
    },
    {
      icon: TrendingUpIcon,
      title: "AI Model Comparison",
      description: "Compare prediction accuracy between Claude, ChatGPT, and Deepseek models"
    },
    {
      icon: ZapIcon,
      title: "Performance Analytics",
      description: "Detailed accuracy metrics and league tables to track AI performance over time"
    }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Minimal geometric background pattern */}
      <div className="absolute inset-0 text-foreground pointer-events-none">
        <svg className="w-full h-full object-cover opacity-40" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
            </pattern>
            <linearGradient id="fadeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:"currentColor", stopOpacity:0.05}} />
              <stop offset="50%" style={{stopColor:"currentColor", stopOpacity:0.02}} />
              <stop offset="100%" style={{stopColor:"currentColor", stopOpacity:0.08}} />
            </linearGradient>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          <circle cx="150" cy="120" r="60" fill="url(#fadeGradient)" />
          <circle cx="650" cy="480" r="80" fill="url(#fadeGradient)" />
          
          <polygon points="200,300 250,200 300,300" fill="currentColor" opacity="0.03" />
          <polygon points="500,150 580,100 560,200" fill="currentColor" opacity="0.04" />
          
          <line x1="0" y1="200" x2="200" y2="200" stroke="currentColor" strokeWidth="1" opacity="0.05" />
          <line x1="600" y1="400" x2="800" y2="400" stroke="currentColor" strokeWidth="1" opacity="0.05" />
        </svg>
      </div>

      {/* Header */}
      <header className="absolute top-0 w-full z-50">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Triangle logo */}
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-foreground"></div>
              <span className="text-lg font-medium text-foreground">
                AIForecast Hub
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex items-center justify-center min-h-screen relative">
        <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
          <div className="space-y-12">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-normal text-foreground leading-tight tracking-wide">
              Compare AI 
              <span className="text-muted-foreground font-light block">
                prediction accuracy
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
              Track and analyze how well Claude, ChatGPT, and Deepseek predict commodity prices.
            </p>
            
            <div className="pt-8">
              <Button
                onClick={handleContinue}
                className="px-8 py-3 text-sm font-medium text-foreground bg-background/60 dark:bg-white/10 hover:bg-background/80 dark:hover:bg-white/20 rounded-lg border border-border dark:border-white/20 hover:border-border/80 dark:hover:border-white/30 transition-all duration-200 backdrop-blur-sm"
                data-testid="continue-button"
              >
                Explore now →
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-8 w-full z-10">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 AIForecast Hub
          </p>
        </div>
      </footer>
    </div>
  );
}