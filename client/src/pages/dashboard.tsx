import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import StatsOverview from "@/components/dashboard/stats-overview";
import LeagueTable from "@/components/dashboard/league-table";
import AllCommoditiesView from "@/components/dashboard/all-commodities-view";
import heroBackground from "@assets/image_1755198621502.png";

export default function Dashboard() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen minimal-bg smooth-transition">
      {/* Ultra-minimal Header */}
      <header className="sticky top-0 z-50 nav-minimal smooth-transition">
        <nav className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Geometric Logo */}
            <div className="flex items-center space-x-3">
              <div className="logo-triangle"></div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">AIForecast Hub</h1>
            </div>
            

            
            {/* Minimal Theme Toggle */}
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="sm"
              className="btn-minimal w-10 h-10 p-0"
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? (
                <SunIcon className="w-4 h-4" />
              ) : (
                <MoonIcon className="w-4 h-4" />
              )}
            </Button>
          </div>
        </nav>
      </header>

      {/* Ultra-clean Main Content */}
      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        
        {/* Hero Stats Section with Background */}
        <section 
          className="mb-16 relative overflow-hidden rounded-2xl"
          style={{
            backgroundImage: `url(@assets/image_1755198621502.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '400px'
          }}
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
          
          {/* Content */}
          <div className="relative z-10 py-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 drop-shadow-lg">
                AI Prediction Performance
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow">
                Real-time tracking of AI model accuracy in commodity price forecasting
              </p>
            </div>
            <div className="px-8">
              <StatsOverview />
            </div>
          </div>
        </section>

        <div className="space-y-16">
          {/* League Table */}
          <LeagueTable />
          
          {/* All Commodities View */}
          <AllCommoditiesView />
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="mt-24 border-t elevated-surface smooth-transition">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="logo-triangle scale-75"></div>
                <span className="font-semibold text-foreground">AIForecast Hub</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                Compare AI model predictions for commodity prices. Track accuracy, analyze performance, and make better trading decisions.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground micro-transition">API Access</a></li>
                <li><a href="#" className="hover:text-foreground micro-transition">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground micro-transition">Data Export</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-4">Support</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground micro-transition">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground micro-transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground micro-transition">Status Page</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border-subtle flex items-center justify-between">
            <p className="text-xs text-muted-foreground">© 2024 AIForecast Hub. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-muted-foreground">Data from Yahoo Finance</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
