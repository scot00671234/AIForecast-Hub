import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLocation, Link } from "wouter";
import { 
  BarChart3Icon, 
  TrendingUpIcon, 
  ZapIcon, 
  MenuIcon, 
  BrainIcon,
  DollarSignIcon,
  ChartBarIcon,
  ArrowRightIcon,
  CheckIcon,
  BotIcon,
  TargetIcon
} from "lucide-react";
import { ThemeToggle } from "../components/theme-toggle";
import { AI_MODELS } from "@/lib/constants";

export default function Landing() {
  const [, navigate] = useLocation();

  const handleGetStarted = () => {
    navigate("/dashboard");
  };

  const features = [
    {
      icon: BotIcon,
      title: "AI Model Comparison",
      description: "Compare prediction accuracy between Claude, ChatGPT, and Deepseek AI models side-by-side with real performance data."
    },
    {
      icon: BarChart3Icon,
      title: "Real-Time Data",
      description: "Live commodity price tracking from Yahoo Finance covering 14 major hard and soft commodities."
    },
    {
      icon: TargetIcon,
      title: "Accuracy Analytics",
      description: "Detailed performance metrics, ranking systems, and trend analysis to track AI prediction reliability."
    }
  ];

  const benefits = [
    "Track 14 major commodities including Oil, Gold, Coffee, and more",
    "Compare Claude, ChatGPT, and Deepseek prediction accuracy",
    "Real-time Yahoo Finance price data integration",
    "Performance rankings and analytics dashboard", 
    "Historical prediction data and trend analysis",
    "Clean, minimalist interface with dark/light themes"
  ];

  const commodities = [
    { name: "Oil", symbol: "CL=F", category: "Energy" },
    { name: "Gold", symbol: "GC=F", category: "Precious Metals" },
    { name: "Coffee", symbol: "KC=F", category: "Soft Commodities" },
    { name: "Copper", symbol: "HG=F", category: "Industrial Metals" },
    { name: "Natural Gas", symbol: "NG=F", category: "Energy" },
    { name: "Silver", symbol: "SI=F", category: "Precious Metals" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 w-full z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-6 md:px-6 py-6 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-foreground"></div>
              <span className="text-lg font-medium text-foreground">AIForecast Hub</span>
            </div>
            <div className="flex items-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6 md:px-6 relative overflow-hidden">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-30 dark:opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg width='800' height='600' viewBox='0 0 800 600' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='currentColor' stroke-width='0.5' opacity='0.1'/%3E%3C/pattern%3E%3ClinearGradient id='fadeGradient' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:currentColor;stop-opacity:0.05' /%3E%3Cstop offset='50%25' style='stop-color:currentColor;stop-opacity:0.02' /%3E%3Cstop offset='100%25' style='stop-color:currentColor;stop-opacity:0.08' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3Ccircle cx='150' cy='120' r='60' fill='url(%23fadeGradient)' /%3E%3Ccircle cx='650' cy='480' r='80' fill='url(%23fadeGradient)' /%3E%3Cpolygon points='200,300 250,200 300,300' fill='currentColor' opacity='0.03' /%3E%3Cpolygon points='500,150 580,100 560,200' fill='currentColor' opacity='0.04' /%3E%3Cline x1='0' y1='200' x2='200' y2='200' stroke='currentColor' stroke-width='1' opacity='0.05' /%3E%3Cline x1='600' y1='400' x2='800' y2='400' stroke='currentColor' stroke-width='1' opacity='0.05' /%3E%3C/svg%3E")`,
            backgroundSize: '800px 600px',
            backgroundRepeat: 'repeat',
            backgroundPosition: 'top left'
          }}
        />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-light text-foreground leading-tight">
                AI Commodity Price
                <span className="text-muted-foreground block font-normal">
                  Prediction Analysis
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
                Compare the accuracy of leading AI models in predicting commodity prices with real market data and comprehensive analytics.
              </p>
            </div>
            
            <div className="pt-4">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="px-8 py-4 text-base font-medium min-h-[48px]"
                data-testid="get-started-button"
              >
                Get Started <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 px-6 md:px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-light text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform provides comprehensive AI prediction analysis with real market data
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="border-border/50 bg-background/50">
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-medium">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Models Section */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-light text-foreground mb-4">
              AI Models Compared
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Track and compare prediction accuracy across leading AI models
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {Object.entries(AI_MODELS).map(([key, model]) => (
              <div key={key} className="text-center p-6">
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${model.color}20`, border: `2px solid ${model.color}40` }}
                >
                  <BrainIcon className="h-8 w-8" style={{ color: model.color }} />
                </div>
                <h3 className="text-xl font-medium mb-2">{model.name}</h3>
                <p className="text-muted-foreground text-sm">{model.provider}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commodities Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-light text-foreground mb-4">
              Tracked Commodities
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Real-time price data and AI predictions for major commodity markets
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {commodities.map((commodity, index) => (
              <div key={index} className="bg-background/70 rounded-lg p-6 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-foreground">{commodity.name}</h3>
                  <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {commodity.symbol}
                  </code>
                </div>
                <p className="text-sm text-muted-foreground">{commodity.category}</p>
              </div>
            ))}
            <div className="bg-background/70 rounded-lg p-6 border border-dashed border-border/50 flex items-center justify-center">
              <p className="text-muted-foreground text-sm">
                + 8 more commodities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light text-foreground mb-4">
              Why Choose AIForecast Hub
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to analyze AI prediction performance
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-light text-foreground">
              Start Analyzing AI Predictions Today
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get instant access to comprehensive AI model comparisons and real-time commodity price tracking.
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="px-8 py-3 text-base font-medium"
              data-testid="cta-button"
            >
              Access Dashboard <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-muted-foreground"></div>
              <span className="text-sm text-muted-foreground">AIForecast Hub</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>© 2025 AIForecast Hub</p>
              <p>Loremt ApS CVR-nr 41691360</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}