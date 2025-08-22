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
  TargetIcon,
  ActivityIcon,
  PlayIcon
} from "lucide-react";
import { ThemeToggle } from "../components/theme-toggle";
import { AI_MODELS } from "@/lib/constants";
import { motion } from "framer-motion";
import { LivePriceCard } from "@/components/LivePriceCard";
import { useQuery } from "@tanstack/react-query";

export default function Landing() {
  const [, navigate] = useLocation();

  const handleGetStarted = () => {
    navigate("/dashboard");
  };

  // Fetch live commodities data for the landing page
  const { data: commodities = [] } = useQuery<any[]>({
    queryKey: ['/api/commodities'],
    staleTime: 300000, // 5 minutes
  });

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


  return (
    <div className="min-h-screen bg-background">
      {/* Announcement Banner */}
      <div className="bg-foreground text-background text-center py-3 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-medium">
            <span className="inline-block bg-background/20 text-background px-2 py-1 rounded-full text-xs font-semibold mr-3">New</span>
            AI Commodity Prediction Platform - Compare Claude, ChatGPT & Deepseek accuracy
            <Link href="/dashboard" className="ml-2 underline hover:no-underline font-semibold">
              Try Now →
            </Link>
          </p>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 w-full z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-foreground"></div>
              <span className="text-lg font-semibold text-foreground">AIForecast Hub</span>
            </div>
            
            {/* Navigation - hidden on mobile, shown on desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button 
                onClick={handleGetStarted}
                size="sm" 
                className="hidden md:inline-flex"
                data-testid="header-cta-button"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-32 md:py-48 px-6 md:px-6 relative overflow-hidden">
        {/* Simplified, cleaner background */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--muted)_0%,_transparent_50%)] opacity-30" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div 
            className="space-y-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="space-y-10">
              <motion.h1 
                className="text-5xl md:text-7xl font-semibold text-foreground leading-[1.05] tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              >
                Compare AI Models on
                <span className="block text-muted-foreground font-medium mt-2">
                  Commodity Predictions
                </span>
              </motion.h1>
              <motion.p 
                className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-normal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              >
                Track and analyze the prediction accuracy of Claude, ChatGPT, and Deepseek 
                across 14 major commodities with real market data.
              </motion.p>
            </div>
            
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            >
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="px-8 py-4 text-base font-medium min-h-[52px] bg-foreground text-background hover:bg-foreground/90 hover:scale-105 transition-all duration-200"
                data-testid="get-started-button"
              >
                Start Analyzing <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/about")}
                className="px-8 py-4 text-base font-medium min-h-[52px] border-border/50 hover:bg-muted/50 hover:scale-105 transition-all duration-200"
                data-testid="learn-more-button"
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-40 px-6 md:px-6 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-20 md:mb-24"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6 tracking-tight">
              How It Works
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Get comprehensive insights into AI prediction performance with real-time market data
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                  viewport={{ once: true, margin: "-50px" }}
                >
                  <Card className="border-border/30 bg-background/50 hover:bg-background/80 hover:scale-105 transition-all duration-300 h-full">
                    <CardHeader className="text-center pb-6">
                      <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <IconComponent className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-2xl font-semibold mb-4">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground text-center leading-relaxed text-lg">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Models Section */}
      <section className="py-24 md:py-40 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-20 md:mb-24"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6 tracking-tight">
              AI Models Compared
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Track and compare prediction accuracy across leading AI models
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {Object.entries(AI_MODELS).map(([key, model], index) => (
              <motion.div 
                key={key} 
                className="text-center p-8 rounded-2xl border border-border/30 bg-background/50 hover:bg-background/80 hover:scale-105 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <div 
                  className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                  style={{ backgroundColor: `${model.color}15`, border: `2px solid ${model.color}30` }}
                >
                  <BrainIcon className="h-10 w-10" style={{ color: model.color }} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{model.name}</h3>
                <p className="text-muted-foreground">{model.provider}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Market Data Section */}
      <section className="py-24 md:py-32 px-6 md:px-6 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16 md:mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">LIVE PRICES</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6 tracking-tight">
              Real-Time Market Data
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Live commodity prices powered by our optimized Yahoo Finance integration
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
          >
            {commodities.slice(0, 6).map((commodity, index: number) => (
              <motion.div
                key={commodity.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <LivePriceCard
                  commodityId={commodity.id}
                  name={commodity.name}
                  symbol={commodity.symbol}
                  unit={commodity.unit}
                />
              </motion.div>
            ))}
          </motion.div>
          
          {commodities.length > 6 && (
            <div className="text-center">
              <p className="text-muted-foreground mb-6">
                + {commodities.length - 6} more commodities tracked
              </p>
              <Button
                onClick={handleGetStarted}
                variant="outline"
                className="bg-background/80 backdrop-blur-sm hover:bg-background"
              >
                View All Markets <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-24 md:py-32 px-6 md:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16 md:mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6 tracking-tight">
              See It In Action
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Get a preview of our comprehensive analytics dashboard
            </p>
          </motion.div>
          
          <motion.div 
            className="relative max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <div className="relative bg-gradient-to-br from-background via-background to-muted/40 rounded-2xl border border-border/40 p-6 md:p-8 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">aiforecast-hub.com/dashboard</span>
                </div>
                <Button
                  onClick={handleGetStarted}
                  size="sm"
                  variant="outline"
                  className="backdrop-blur-sm"
                >
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Open Dashboard
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-border/30 bg-background/60 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Predictions Made</span>
                        <ActivityIcon className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="text-2xl font-bold">1,247</div>
                      <div className="text-xs text-green-600">+23% this week</div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/30 bg-background/60 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Top Model</span>
                        <TargetIcon className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="text-2xl font-bold">Deepseek</div>
                      <div className="text-xs text-green-600">89.4% accuracy</div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/30 bg-background/60 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Markets</span>
                        <BarChart3Icon className="h-4 w-4 text-purple-500" />
                      </div>
                      <div className="text-2xl font-bold">14</div>
                      <div className="text-xs text-blue-600">All active</div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="border-border/30 bg-background/60 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">AI Model Performance</h3>
                      <div className="flex space-x-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Claude</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>ChatGPT</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Deepseek</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-32 bg-muted/30 rounded-lg flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">Interactive Chart Area</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-muted/20">
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
      <section className="py-24 md:py-32 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto text-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight">
              Start Analyzing AI Predictions Today
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Get instant access to comprehensive AI model comparisons and real-time commodity price tracking.
            </p>
            <div className="pt-4">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="px-10 py-4 text-lg font-medium min-h-[56px] bg-foreground text-background hover:bg-foreground/90"
                data-testid="cta-button"
              >
                Access Dashboard <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-border/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-muted-foreground"></div>
              <span className="text-base font-semibold text-foreground">AIForecast Hub</span>
            </div>
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                Dashboard
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                About
              </Link>
              <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                FAQ
              </Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                Blog
              </Link>
              <Link href="/policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                Policy
              </Link>
            </div>
            <div className="text-sm text-muted-foreground text-center md:text-right space-y-1">
              <p>© 2025 AIForecast Hub</p>
              <p className="text-xs">Loremt ApS CVR-nr 41691360</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}