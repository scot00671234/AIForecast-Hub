import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ChevronRightIcon, BarChart3Icon, TrendingUpIcon, ZapIcon } from "lucide-react";
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
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="absolute top-0 w-full z-50">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-white rounded-md"></div>
              <span className="text-lg font-medium text-white">
                AIForecast Hub
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex items-center justify-center min-h-screen">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <div className="space-y-12">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-normal text-white leading-tight tracking-wide">
              Compare AI 
              <span className="text-gray-400 font-light block">
                prediction accuracy
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
              Track and analyze how well Claude, ChatGPT, and Deepseek predict commodity prices.
            </p>
            
            <div className="pt-8">
              <Button
                onClick={handleContinue}
                className="px-8 py-3 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 hover:border-white/30 transition-all duration-200"
                data-testid="continue-button"
              >
                Explore now →
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-8 w-full">
        <div className="text-center">
          <p className="text-xs text-gray-600">
            © 2024 AIForecast Hub
          </p>
        </div>
      </footer>
    </div>
  );
}