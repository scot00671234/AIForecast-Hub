import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { NavigationMenu } from "../components/navigation-menu";
import OverallModelRankings from "@/components/dashboard/overall-model-rankings";
import AllCommoditiesView from "@/components/dashboard/all-commodities-view";
import { CompositeIndexGauge } from "@/components/CompositeIndexGauge";
import PredictionStatsCard from "@/components/PredictionStatsCard";
import MarketStatusCard from "@/components/MarketStatusCard";
import BottomBanner from "@/components/ads/BottomBanner";
import { motion } from "framer-motion";
import type { Commodity } from "@shared/schema";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location] = useLocation();

  const { data: commodities = [] } = useQuery<Commodity[]>({
    queryKey: ["/api/commodities"],
  });

  // Filter commodities based on search query
  const filteredCommodities = commodities.filter(commodity =>
    commodity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    commodity.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    commodity.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background relative">
      {/* Modern background pattern matching landing page */}
      <div className="absolute inset-0">
        {/* Clean gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/15" />
        
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10 bg-grid-minimal" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-all duration-200">
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-foreground"></div>
              <span className="font-semibold text-lg text-foreground">AIForecast Hub</span>
            </Link>
          
            <div className="flex items-center space-x-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search commodities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-40 sm:w-48 md:w-64 bg-background/60 dark:bg-white/10 border-border/50 dark:border-white/20 focus:border-border/80 dark:focus:border-white/30 placeholder:text-muted-foreground min-h-[44px] transition-all duration-200 focus:scale-105"
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
              
              <NavigationMenu currentPath={location} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-24">
        
        {/* Hero Section */}
        <motion.section 
          className="mb-20 md:mb-32"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6 md:mb-8 tracking-tight">
              AI Prediction Performance
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Real-time analysis of AI model accuracy across commodity markets
            </p>
          </div>
        </motion.section>

        <div className="space-y-20 md:space-y-32">
          {/* Dashboard Cards Grid */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              >
                <CompositeIndexGauge />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              >
                <PredictionStatsCard />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
              >
                <MarketStatusCard />
              </motion.div>
            </div>
          </motion.section>
          
          {/* Overall Model Rankings */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <OverallModelRankings />
          </motion.div>
          
          {/* All Commodities View */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <AllCommoditiesView filteredCommodities={searchQuery ? filteredCommodities : undefined} />
          </motion.div>
        </div>
      </main>

      {/* Bottom Banner Ad */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <BottomBanner />
      </motion.div>

      {/* Modern Footer - matching landing page */}
      <footer className="relative z-10 border-t border-border/30 mt-20 md:mt-32">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-20">
          <motion.div 
            className="text-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center space-x-3">
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-foreground"></div>
              <span className="font-semibold text-foreground">AIForecast Hub</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>© 2025 AIForecast Hub</p>
              <p className="text-xs">Loremt ApS CVR-nr 41691360</p>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
