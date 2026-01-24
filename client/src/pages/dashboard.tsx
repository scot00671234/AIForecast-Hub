import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { PageHeader } from "../components/page-header";
import OverallModelRankings from "@/components/dashboard/overall-model-rankings";
import AllCommoditiesView from "@/components/dashboard/all-commodities-view";
import { CompositeIndexGauge } from "@/components/CompositeIndexGauge";
import PredictionStatsCard from "@/components/PredictionStatsCard";
import MarketStatusCard from "@/components/MarketStatusCard";
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
      
      {/* Dark corporate background matching landing page */}
      <div className="absolute inset-0">
        {/* Dark gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/1 via-black/2 to-black/4" />
        
        {/* Subtle geometric patterns overlay */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="corporateGrid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="0.3"/>
                <circle cx="40" cy="40" r="1" fill="currentColor" opacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#corporateGrid)" />
          </svg>
        </div>
        
        {/* Subtle accent lines */}
        <div className="absolute top-1/4 left-1/4 w-24 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
        <div className="absolute top-3/4 right-1/4 w-20 h-px bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent" />
      </div>

      {/* Header */}
      <PageHeader 
        currentPath={location}
        showSearch={true}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search commodities..."
      >
        {searchQuery && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-lg shadow-2xl ring-1 ring-white/10 dark:ring-white/5 max-h-60 overflow-y-auto z-50">
            {filteredCommodities.length > 0 ? (
              filteredCommodities.map(commodity => (
                <div
                  key={commodity.id}
                  className="px-4 py-3 hover:bg-white/10 dark:hover:bg-white/5 cursor-pointer border-b border-white/10 dark:border-white/5 last:border-b-0 transition-colors duration-150"
                  onClick={() => {
                    // Don't clear search query - keep the filtering active
                    // Better scroll targeting - look for the commodity card more reliably
                    const commodityCard = document.querySelector(`[data-commodity-id="${commodity.id}"]`) || 
                                         document.getElementById(`commodity-${commodity.id}`) ||
                                         document.querySelector(`[data-testid="commodity-card-${commodity.id}"]`);
                    if (commodityCard) {
                      commodityCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else {
                      // Fallback: scroll to all commodities section
                      document.querySelector('[data-testid="all-commodities-section"]')?.scrollIntoView({ behavior: 'smooth' });
                    }
                    
                    // Close the search dropdown after a short delay
                    setTimeout(() => {
                      const searchInput = document.querySelector('[data-testid="input-search-commodities"]') as HTMLInputElement;
                      searchInput?.blur();
                    }, 100);
                  }}
                  data-testid={`search-result-${commodity.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{commodity.name}</p>
                      <p className="text-sm text-muted-foreground">{commodity.symbol} • {commodity.category}</p>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      {commodity.unit}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-muted-foreground text-center font-medium">
                No commodities found
              </div>
            )}
          </div>
        )}
      </PageHeader>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-24">
        
        {/* Hero Section */}
        <motion.section 
          className="mb-20 md:mb-32"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-foreground mb-4 md:mb-6 tracking-tight">
              AI Prediction Performance
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
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
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ scale: 1.005, y: -0.5 }}
                className="hover:z-10"
              >
                <CompositeIndexGauge />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ scale: 1.005, y: -0.5 }}
                className="hover:z-10"
              >
                <PredictionStatsCard />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ scale: 1.005, y: -0.5 }}
                className="hover:z-10"
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
              <span className="text-lg font-semibold text-foreground">AIForecast Hub</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-3">
              <div className="space-y-1">
                <p>© 2025 AIForecast Hub</p>
                <p className="text-xs">Loremt ApS CVR-nr 41691360</p>
              </div>
              <p className="text-xs opacity-75 leading-relaxed max-w-2xl mx-auto">
                Legal Disclaimer: Information provided is for general informational purposes only and does not constitute legal, financial, or professional advice. Loremt ApS accepts no responsibility or liability for decisions made based on this information.
              </p>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
