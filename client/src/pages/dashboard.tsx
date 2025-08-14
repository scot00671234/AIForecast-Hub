import { useQuery } from "@tanstack/react-query";
import { ChartLineIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import StatsOverview from "@/components/dashboard/stats-overview";
import LeagueTable from "@/components/dashboard/league-table";
import CommoditySelector from "@/components/dashboard/commodity-selector";
import PriceChart from "@/components/dashboard/price-chart";
import RecentActivity from "@/components/dashboard/recent-activity";
import MarketAlerts from "@/components/dashboard/market-alerts";
import AccuracyMetrics from "@/components/dashboard/accuracy-metrics";

export default function Dashboard() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen gradient-bg smooth-transition">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md glass-card border-b smooth-transition">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-primary to-indigo-600 rounded-lg flex items-center justify-center">
                <ChartLineIcon className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">AIForecast Hub</h1>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-foreground font-medium smooth-transition hover:text-primary" data-testid="nav-dashboard">
                Dashboard
              </a>
              <a href="#" className="text-muted-foreground font-medium smooth-transition hover:text-primary" data-testid="nav-commodities">
                Commodities
              </a>
              <a href="#" className="text-muted-foreground font-medium smooth-transition hover:text-primary" data-testid="nav-analytics">
                Analytics
              </a>
              <a href="#" className="text-muted-foreground font-medium smooth-transition hover:text-primary" data-testid="nav-api">
                API
              </a>
            </div>
            
            {/* Theme Toggle */}
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="sm"
              className="glass-card smooth-transition"
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Overview */}
        <section className="mb-8">
          <StatsOverview />
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* League Table */}
          <div className="lg:col-span-2">
            <LeagueTable />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <CommoditySelector />
            <RecentActivity />
          </div>
        </div>

        {/* Price Chart */}
        <section className="mt-8">
          <PriceChart />
        </section>

        {/* Accuracy Metrics */}
        <section className="mt-8 grid md:grid-cols-2 gap-8">
          <AccuracyMetrics />
          <MarketAlerts />
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t glass-card smooth-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-tr from-primary to-indigo-600 rounded-md flex items-center justify-center">
                  <ChartLineIcon className="w-3 h-3 text-white" />
                </div>
                <span className="font-semibold text-foreground">AIForecast Hub</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                Compare AI model predictions for commodity prices. Track accuracy, analyze performance, and make better trading decisions.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary smooth-transition">API Access</a></li>
                <li><a href="#" className="hover:text-primary smooth-transition">Documentation</a></li>
                <li><a href="#" className="hover:text-primary smooth-transition">Data Export</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary smooth-transition">Help Center</a></li>
                <li><a href="#" className="hover:text-primary smooth-transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary smooth-transition">Status Page</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t flex items-center justify-between">
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
