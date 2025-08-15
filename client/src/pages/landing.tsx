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
    <div className="min-h-screen minimal-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-5xl mx-auto px-8 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="logo-triangle"></div>
              <span className="text-lg font-medium text-foreground tracking-tight">
                AIForecast Hub
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-8 lg:px-12 pt-24 md:pt-32 lg:pt-40 pb-32 text-center">
          <div className="space-y-12">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1] animate-fade-in">
              Compare AI
              <span className="block text-primary mt-2">Prediction Accuracy</span>
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
              Track and analyze how well Claude, ChatGPT, and Deepseek predict commodity prices. Real-time data, comprehensive analytics, and performance insights.
            </p>
            
            <div className="pt-8">
              <Button
                onClick={handleContinue}
                size="lg"
                className="h-12 md:h-14 px-8 md:px-12 text-base md:text-lg font-medium bg-primary hover:bg-primary/90 text-white rounded-xl transition-all duration-200 hover:scale-105"
                data-testid="continue-button"
              >
                Continue to Dashboard
                <ChevronRightIcon className="w-4 md:w-5 h-4 md:h-5 ml-2" />
              </Button>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mt-32 animate-fade-in-delayed" style={{ animationDelay: "0.2s" }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.title}
                  className="border-0 bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  data-testid={`feature-${index}`}
                >
                  <CardContent className="p-8 lg:p-10 text-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>


      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-32">
        <div className="max-w-5xl mx-auto px-8 lg:px-12 py-16">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="logo-triangle scale-75"></div>
              <span className="font-medium text-foreground text-sm">AIForecast Hub</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2024 AIForecast Hub. Built with real-time Yahoo Finance data.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}