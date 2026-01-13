import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  PlayIcon,
  ClockIcon
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
    <div className="min-h-screen bg-background relative">
      {/* Clean blur background */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        {/* Soft blur orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-muted-foreground/4 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-muted-foreground/3 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '14s', animationDelay: '1s' }} />
          <div className="absolute top-1/6 right-1/3 w-56 h-56 bg-primary/4 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '16s', animationDelay: '3s' }} />
        </div>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/20 to-background/40" />
        
        {/* Additional soft blur elements */}
        <div className="absolute inset-0">
          <div className="absolute top-2/3 left-1/6 w-48 h-48 bg-muted-foreground/2 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '18s', animationDelay: '5s' }} />
          <div className="absolute bottom-1/6 right-1/6 w-40 h-40 bg-primary/2 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '20s', animationDelay: '2s' }} />
        </div>
      </div>


      {/* Header - Transparent over hero */}
      <header className="absolute top-0 w-full z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Floating Pill Navigation */}
          <div className="flex justify-center">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-8 py-4 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <div className="flex items-center space-x-10">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-white"></div>
                  <span className="text-base font-semibold text-white drop-shadow-lg">AIForecast Hub</span>
                </Link>
                
                {/* Navigation Links - hidden on mobile, shown on desktop */}
            <nav className="hidden md:flex items-center space-x-8">
                  <Link href="/dashboard" className="text-sm text-white/80 hover:text-white transition-colors font-medium drop-shadow-md">Dashboard</Link>
                  <Link href="/about" className="text-sm text-white/80 hover:text-white transition-colors font-medium drop-shadow-md">About</Link>
                  <Link href="/faq" className="text-sm text-white/80 hover:text-white transition-colors font-medium drop-shadow-md">FAQ</Link>
                  <Link href="/blog" className="text-sm text-white/80 hover:text-white transition-colors font-medium drop-shadow-md">Blog</Link>
            </nav>
            
                {/* Right side actions */}
            <div className="flex items-center space-x-4">
              <ThemeToggle variant="landing" />
              <Button 
                onClick={handleGetStarted}
                size="sm" 
                variant="minimal"
                    className="hidden md:inline-flex text-sm font-medium px-4 py-2 h-auto rounded-full border border-white/40 text-white hover:bg-white/10 backdrop-blur-sm"
                data-testid="header-cta-button"
              >
                Get Started
              </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Height with Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 md:pt-24">
        {/* Full background image extending behind navbar */}
        <div className="absolute inset-0 -top-20">
          {/* Hero background image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
              backgroundAttachment: 'fixed'
            }}
          />
          
          {/* Strong overlay for text readability */}
          <div className="absolute inset-0 bg-black/40 dark:bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          {/* Clean geometric patterns overlay */}
          <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="corporateGrid" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.3"/>
                  <circle cx="40" cy="40" r="1" fill="white" opacity="0.2"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#corporateGrid)" />
            </svg>
          </div>
          
          {/* Subtle corporate accent lines */}
          <div className="absolute top-1/3 left-1/4 w-32 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute top-2/3 right-1/4 w-24 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          <div className="absolute top-1/2 left-1/6 w-16 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative px-4 md:px-6 py-8 md:py-12">
          <motion.div 
            className="space-y-8 md:space-y-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="space-y-8 md:space-y-12">
              <motion.h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] tracking-tight drop-shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              >
                <span className="block">Which AI Tool Is Best to</span>
                <span className="block text-white/90 font-light mt-1 md:mt-2 drop-shadow-xl">
                  Predict Future Commodity Prices?
                </span>
              </motion.h1>
              
              <motion.div
                className="max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              >
                <p className="text-lg sm:text-xl md:text-2xl text-white/90 leading-relaxed font-light mb-6 drop-shadow-lg">
                Track and analyze the prediction accuracy of Claude, ChatGPT, and Deepseek 
                across 14 major commodities with real market data.
                </p>
                
                {/* Corporate tagline */}
                <div className="flex items-center justify-center space-x-4 text-sm text-white/80">
                  <div className="w-8 h-px bg-white/40"></div>
                  <span className="font-medium">Professional AI Analytics Platform</span>
                  <div className="w-8 h-px bg-white/40"></div>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 md:pt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            >
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="px-10 py-4 text-base font-semibold rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 bg-white text-black hover:bg-white/95 border border-white/30"
                data-testid="get-started-button"
              >
                Start Analyzing
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/about")}
                className="px-10 py-4 text-base font-semibold rounded-lg border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 transition-all duration-300 backdrop-blur-sm bg-transparent"
                data-testid="learn-more-button"
              >
                Learn More
              </Button>
            </motion.div>
            
            {/* Corporate trust indicators */}
            <motion.div 
              className="pt-8 md:pt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
            >
              <div className="flex flex-wrap items-center justify-center gap-8 text-xs text-white/70">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full shadow-lg"></div>
                  <span>Real-time Data</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full shadow-lg"></div>
                  <span>Professional Analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full shadow-lg"></div>
                  <span>Enterprise Ready</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 px-6 md:px-6 relative z-10 bg-black/5 dark:bg-black/10">
        <div className="relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4 tracking-tight">
              How It Works
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Get comprehensive insights into AI prediction performance with real-time market data
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
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
                  <Card className="relative border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 h-full overflow-hidden group">
                    {/* Subtle glare effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Enhanced shadow and border */}
                    <div className="absolute inset-0 rounded-lg shadow-xl group-hover:shadow-3xl transition-shadow duration-300" />
                    
                    <CardHeader className="text-center pb-4 relative z-10">
                      <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 border border-primary/20">
                        <IconComponent className="h-7 w-7 text-primary" />
                      </div>
                      <CardTitle className="text-lg font-semibold mb-2 text-foreground">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 relative z-10">
                      <p className="text-muted-foreground text-center leading-relaxed text-sm">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
        </div>
      </section>

      {/* AI Models Section */}
      <section className="py-16 md:py-24 px-4 md:px-6 relative z-10 bg-black/10 dark:bg-black/20">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4 tracking-tight">
              AI Models Compared
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Track and compare prediction accuracy across leading AI models
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {Object.entries(AI_MODELS).map(([key, model], index) => (
              <motion.div 
                key={key} 
                className="relative text-center p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                viewport={{ once: true, margin: "-50px" }}
              >
                {/* Subtle glare effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Enhanced shadow */}
                <div className="absolute inset-0 rounded-2xl shadow-xl group-hover:shadow-3xl transition-shadow duration-300" />
                
                <div className="relative z-10">
                  <div 
                    className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300"
                    style={{ 
                      backgroundColor: `${model.color}20`, 
                      border: `2px solid ${model.color}30`,
                      boxShadow: `0 8px 32px ${model.color}15`
                    }}
                  >
                    <BrainIcon className="h-8 w-8" style={{ color: model.color }} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{model.name}</h3>
                  <p className="text-muted-foreground text-sm font-medium">{model.provider}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Market Data Section */}
      <section className="py-16 md:py-24 px-6 md:px-6 relative z-10 bg-black/10 dark:bg-black/20">
        <div className="relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">Live Prices</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4 tracking-tight">
              Real-Time Market Data
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Live commodity prices powered by our optimized Yahoo Finance integration
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
          >
            {commodities.slice(0, 8).map((commodity, index: number) => (
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
          
          {commodities.length > 8 && (
            <div className="text-center">
              <p className="text-muted-foreground mb-6">
                + {commodities.length - 8} more commodities tracked
              </p>
              <Button
                onClick={handleGetStarted}
                variant="outline"
                size="sm"
                className="px-4 py-2 text-sm font-medium rounded-lg"
              >
                View All Markets
              </Button>
            </div>
          )}
        </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-16 md:py-24 px-6 md:px-6 relative z-10 bg-black/5 dark:bg-black/10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4 tracking-tight">
              See It In Action
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
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
                  <span className="text-sm text-muted-foreground">aiforecasthub.com/dashboard</span>
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
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {/* AI Composite Index Mock */}
                  <Card className="border-white/10 bg-white/5 backdrop-blur-xl h-[260px] md:h-[280px] flex flex-col">
                    <CardHeader className="pb-2 md:pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ActivityIcon className="h-4 w-4 text-primary" />
                          <CardTitle className="text-sm font-medium text-foreground">AI Composite Index</CardTitle>
                        </div>
                        <Badge variant="secondary" className="text-xs font-medium px-2 py-1">BULLISH</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 flex-1 flex flex-col justify-center">
                      <div className="text-center space-y-1 md:space-y-2">
                        <div className="text-3xl md:text-4xl font-bold text-foreground">68.0</div>
                        <div className="text-sm text-muted-foreground font-medium">AI Bullish</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 md:gap-6 mt-3 md:mt-5">
                        <div className="text-center space-y-1">
                          <div className="text-lg md:text-xl font-semibold text-foreground">68.2</div>
                          <div className="text-xs text-muted-foreground font-medium">Hard Commodities</div>
                        </div>
                        <div className="text-center space-y-1">
                          <div className="text-lg md:text-xl font-semibold text-foreground">67.8</div>
                          <div className="text-xs text-muted-foreground font-medium">Soft Commodities</div>
                        </div>
                      </div>
                      <div className="text-center mt-3 md:mt-4">
                        <div className="text-xs text-muted-foreground">336 predictions analyzed</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Prediction Stats Mock */}
                  <Card className="border-white/10 bg-white/5 backdrop-blur-xl h-[260px] md:h-[280px] flex flex-col">
                    <CardHeader className="pb-2 md:pb-3">
                      <div className="flex items-center gap-2">
                        <TargetIcon className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm font-medium text-foreground">Prediction Stats</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 flex-1 flex flex-col space-y-4 md:space-y-5">
                      <div className="grid grid-cols-2 gap-6 md:gap-8">
                        <div className="text-center space-y-1">
                          <div className="text-3xl md:text-4xl font-bold text-foreground">336</div>
                          <div className="text-xs text-muted-foreground font-medium">Total Predictions</div>
                        </div>
                        <div className="text-center space-y-1">
                          <div className="text-3xl md:text-4xl font-bold text-foreground">3</div>
                          <div className="text-xs text-muted-foreground font-medium">AI Models</div>
                        </div>
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex justify-between items-center py-1.5 md:py-2 border-b border-border/30">
                          <span className="text-xs text-muted-foreground font-medium">Coverage</span>
                          <span className="text-xs font-semibold text-foreground">14 Commodities</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 md:py-2">
                          <span className="text-xs text-muted-foreground font-medium">Recent Activity</span>
                          <div className="px-2 py-1 bg-muted/50 text-foreground text-xs rounded-full font-medium">Active</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Market Status Mock */}
                  <Card className="border-white/10 bg-white/5 backdrop-blur-xl h-[260px] md:h-[280px] flex flex-col">
                    <CardHeader className="pb-2 md:pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BarChart3Icon className="h-4 w-4 text-primary" />
                          <CardTitle className="text-sm font-medium text-foreground">Market Status</CardTitle>
                        </div>
                        <div className="text-xs font-semibold px-2 py-1 rounded-full inline-flex items-center gap-1.5 bg-muted/50 text-muted-foreground border border-border/50">
                          <ClockIcon className="h-3 md:h-4 w-3 md:w-4" />
                          <span className="hidden sm:inline">Market Closed</span>
                          <span className="sm:hidden">Closed</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 flex-1 flex flex-col justify-center">
                      <div className="space-y-2 md:space-y-3">
                        <div className="flex justify-between items-center py-1.5 md:py-2 border-b border-border/30">
                          <span className="text-xs text-muted-foreground font-medium">Data Source</span>
                          <span className="text-xs font-semibold text-foreground">Yahoo Finance</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 md:py-2 border-b border-border/30">
                          <span className="text-xs text-muted-foreground font-medium">Freshness</span>
                          <span className="text-xs font-semibold text-foreground">Real-time</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 md:py-2">
                          <span className="text-xs text-muted-foreground font-medium">Schedule</span>
                          <span className="text-xs font-semibold text-foreground">
                            <span className="hidden sm:inline">Market opens Monday 9 AM</span>
                            <span className="sm:hidden">Mon 9 AM</span>
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-light text-foreground">AI Model Performance</h2>
                    <div className="text-xs font-semibold px-2 py-1 rounded-md bg-background border border-border/40 text-muted-foreground">
                      Last 30 Days
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 hover:bg-muted/20 -mx-2 px-2 rounded-md transition-colors duration-200">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-muted-foreground font-light">#1</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-sm font-light text-foreground">Deepseek</span>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-light text-foreground">87.4%</div>
                        <div className="text-xs text-muted-foreground font-light">Accuracy</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 hover:bg-muted/20 -mx-2 px-2 rounded-md transition-colors duration-200">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-muted-foreground font-light">#2</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-light text-foreground">Claude</span>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-light text-foreground">84.2%</div>
                        <div className="text-xs text-muted-foreground font-light">Accuracy</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 hover:bg-muted/20 -mx-2 px-2 rounded-md transition-colors duration-200">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-muted-foreground font-light">#3</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                        <span className="text-sm font-light text-foreground">ChatGPT</span>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-light text-foreground">81.9%</div>
                        <div className="text-xs text-muted-foreground font-light">Accuracy</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground font-light pt-2 border-t border-border/20">
                    <span>Based on predictions across all commodities</span>
                    <span>Best performer: 87.4% accuracy</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-6 bg-muted/10 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-medium text-foreground mb-3">
              Why Choose AIForecast Hub
            </h2>
            <p className="text-base text-muted-foreground">
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
      <section className="py-16 md:py-20 px-6 bg-black/20 dark:bg-black/30 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground tracking-tight">
              Start Analyzing AI Predictions Today
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Get instant access to comprehensive AI model comparisons and real-time commodity price tracking.
            </p>
            <div className="pt-2">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="px-8 py-3 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl bg-primary hover:bg-primary/90"
                data-testid="cta-button"
              >
                Access Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-border/40 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 mb-8">
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
              <Link href="/legal" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                Legal
              </Link>
            </div>
            <div className="text-sm text-muted-foreground text-center md:text-right space-y-1">
              <p>© 2025 AIForecast Hub</p>
              <p className="text-xs">Loremt ApS CVR-nr 41691360</p>
            </div>
          </div>
          
          {/* Legal Disclaimer - Centered Below */}
          <div className="text-center border-t border-border/20 pt-6">
            <p className="text-xs text-muted-foreground opacity-75 leading-relaxed max-w-3xl mx-auto">
              Legal Disclaimer: Information provided is for general informational purposes only and does not constitute legal, financial, or professional advice. Loremt ApS accepts no responsibility or liability for decisions made based on this information.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}