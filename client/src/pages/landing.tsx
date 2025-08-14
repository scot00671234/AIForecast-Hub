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
      <header className="nav-minimal sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="logo-triangle"></div>
              <span className="text-xl font-semibold text-foreground tracking-tight">
                AIForecast Hub
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative overflow-hidden min-h-screen">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 pt-32 pb-20 text-center">
          <div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-8 leading-tight animate-fade-in">
              Compare AI
              <span className="block text-primary">Prediction Accuracy</span>
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Track and analyze how well Claude, ChatGPT, and Deepseek predict commodity prices. 
              Real-time data, comprehensive analytics, and performance insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 items-center justify-center mb-20">
              <Button
                onClick={handleContinue}
                size="lg"
                className="h-14 px-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl smooth-transition hover-lift"
                data-testid="continue-button"
              >
                Continue to Dashboard
                <ChevronRightIcon className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-24 animate-fade-in-delayed" style={{ animationDelay: "0.2s" }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.title}
                  className="glass-card hover-lift smooth-transition animate-fade-in-delayed"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  data-testid={`feature-${index}`}
                >
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-4 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA Section */}
        <section className="bg-gradient-to-t from-muted/20 to-transparent py-20">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <Card className="glass-card hover-lift smooth-transition">
              <CardContent className="p-12">
                <h2 className="text-3xl font-semibold text-foreground mb-6 tracking-tight">
                  Ready to explore AI prediction performance?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Get insights into commodity price forecasting with real market data and comprehensive analytics.
                </p>
                <Button
                  onClick={handleContinue}
                  size="lg"
                  className="h-12 px-10 text-base font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl micro-transition"
                  data-testid="bottom-continue-button"
                >
                  Get Started
                  <ChevronRightIcon className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t elevated-surface mt-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="logo-triangle scale-75"></div>
              <span className="font-semibold text-foreground">AIForecast Hub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 AIForecast Hub. Built with real-time Yahoo Finance data.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}