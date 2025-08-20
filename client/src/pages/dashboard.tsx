import { MoonIcon, SunIcon, SearchIcon, MenuIcon } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "wouter";
import OverallModelRankings from "@/components/dashboard/overall-model-rankings";
import AllCommoditiesView from "@/components/dashboard/all-commodities-view";
import { CompositeIndexGauge } from "@/components/CompositeIndexGauge";
import PredictionStatsCard from "@/components/PredictionStatsCard";
import MarketStatusCard from "@/components/MarketStatusCard";
import type { Commodity } from "@shared/schema";

export default function Dashboard() {
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: commodities = [] } = useQuery<Commodity[]>({
    queryKey: ["/api/commodities"],
  });

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Filter commodities based on search query
  const filteredCommodities = commodities.filter(commodity =>
    commodity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    commodity.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    commodity.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-6 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <div className="flex items-center space-x-3 cursor-pointer">
                  {/* Triangle logo - same as landing */}
                  <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-foreground"></div>
                  <span className="text-lg font-medium text-foreground">
                    AIForecast Hub
                  </span>
                </div>
              </Link>
            </div>
            
            {/* Search Bar and Menu */}
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search commodities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-40 sm:w-48 md:w-64 bg-background/60 dark:bg-white/10 border-border dark:border-white/20 focus:border-border/80 dark:focus:border-white/30 placeholder:text-muted-foreground min-h-[44px]"
                  data-testid="input-search-commodities"
                />
                {searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 dark:bg-black/95 backdrop-blur-md border border-border dark:border-white/20 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                    {filteredCommodities.length > 0 ? (
                      filteredCommodities.map(commodity => (
                        <div
                          key={commodity.id}
                          className="px-4 py-3 hover:bg-muted/50 dark:hover:bg-white/5 cursor-pointer border-b border-border/50 last:border-b-0"
                          onClick={() => {
                            setSearchQuery("");
                            document.getElementById(`commodity-${commodity.id}`)?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          data-testid={`search-result-${commodity.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-foreground">{commodity.name}</p>
                              <p className="text-sm text-muted-foreground">{commodity.symbol} • {commodity.category}</p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {commodity.unit}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-muted-foreground text-center">
                        No commodities found
                      </div>
                    )}
                  </div>
                )}
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
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <MenuIcon className="h-[1.2rem] w-[1.2rem]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/blog">Blog</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/policy">Policy</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-8 md:py-16">
        
        {/* Hero Section */}
        <section className="mb-12 md:mb-20">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-normal text-foreground mb-4 md:mb-6 tracking-wide">
              AI Prediction Performance
            </h2>
          </div>
        </section>

        <div className="space-y-12 md:space-y-20">
          {/* Dashboard Cards Grid */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <CompositeIndexGauge />
              <PredictionStatsCard />
              <MarketStatusCard />
            </div>
          </section>
          
          {/* Overall Model Rankings */}
          <OverallModelRankings />
          
          {/* All Commodities View */}
          <AllCommoditiesView filteredCommodities={searchQuery ? filteredCommodities : undefined} />
        </div>
      </main>

      {/* Minimal Footer - matching landing page */}
      <footer className="relative z-10 border-t border-border/50 mt-16 md:mt-32">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-8 md:py-16">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-foreground"></div>
              <span className="font-medium text-foreground">AIForecast Hub</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>© 2025 AIForecast Hub</p>
              <p className="text-xs">Loremt ApS CVR-nr 41691360</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
