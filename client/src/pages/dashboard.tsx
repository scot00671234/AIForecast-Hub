import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import StatsOverview from "@/components/dashboard/stats-overview";
import LeagueTable from "@/components/dashboard/league-table";
import AllCommoditiesView from "@/components/dashboard/all-commodities-view";
import { FuturePredictionsChart } from "@/components/dashboard/future-predictions-chart";

export default function Dashboard() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Minimal geometric background pattern - same as landing */}
      <div className="absolute inset-0 text-foreground pointer-events-none">
        <svg className="w-full h-full object-cover opacity-20" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dashboardGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
            </pattern>
            <linearGradient id="dashboardFadeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:"currentColor", stopOpacity:0.03}} />
              <stop offset="50%" style={{stopColor:"currentColor", stopOpacity:0.01}} />
              <stop offset="100%" style={{stopColor:"currentColor", stopOpacity:0.04}} />
            </linearGradient>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#dashboardGrid)" />
          <circle cx="150" cy="120" r="60" fill="url(#dashboardFadeGradient)" />
          <circle cx="650" cy="480" r="80" fill="url(#dashboardFadeGradient)" />
          <polygon points="200,300 250,200 300,300" fill="currentColor" opacity="0.02" />
          <polygon points="500,150 580,100 560,200" fill="currentColor" opacity="0.02" />
        </svg>
      </div>

      {/* Minimal Header - matching landing page */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Triangle logo - same as landing */}
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-foreground"></div>
              <span className="text-lg font-medium text-foreground">
                AIForecast Hub
              </span>
            </div>
            
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0 hover:bg-background/60 dark:hover:bg-white/10 transition-colors"
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? (
                <SunIcon className="w-4 h-4" />
              ) : (
                <MoonIcon className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-8 py-16">
        
        {/* Hero Section */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal text-foreground mb-6 tracking-wide">
              AI Prediction Performance
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
              Real-time tracking of AI model accuracy in commodity price forecasting
            </p>
          </div>
        </section>

        <div className="space-y-20">
          {/* League Table */}
          <LeagueTable />
          
          {/* All Commodities View */}
          <AllCommoditiesView />
        </div>
      </main>

      {/* Minimal Footer - matching landing page */}
      <footer className="relative z-10 border-t border-border/50 mt-32">
        <div className="max-w-6xl mx-auto px-8 py-16">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-foreground"></div>
              <span className="font-medium text-foreground">AIForecast Hub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 AIForecast Hub.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
