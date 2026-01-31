import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { motion } from "framer-motion";
import type { AiModel } from "@shared/schema";

interface OverallModelRanking {
  rank: number;
  aiModel: AiModel;
  accuracy: number;
  totalPredictions: number;
  trend: number; // 1 for up, -1 for down, 0 for stable
}

export default function OverallModelRankings() {
  const [selectedPeriod, setSelectedPeriod] = useState("90d");

  const { data: rankings, isLoading } = useQuery<OverallModelRanking[]>({
    queryKey: ["/api/league-table", selectedPeriod],
    queryFn: () => fetch(`/api/league-table/${selectedPeriod}`).then(res => res.json()),
    enabled: true,
  });

  if (isLoading) {
    return (
      <div className="glass-card hover-lift shimmer p-6 space-y-6 relative overflow-hidden group">
        {/* Enhanced glare effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="flex items-center justify-between relative z-10">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="space-y-3 relative z-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 px-4 glass-card bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-6 h-4" />
                <Skeleton className="w-2 h-2 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="text-right">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!rankings || rankings.length === 0) {
    return (
      <div className="glass-card hover-lift p-6 space-y-6 relative overflow-hidden group">
        {/* Subtle glare effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="flex items-center justify-between relative z-10">
          <h2 className="text-lg font-light text-foreground">Model Rankings</h2>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32 h-8 glass-card border-white/20 bg-white/10 backdrop-blur-sm text-sm rounded-lg font-light hover:bg-white/20 transition-all duration-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/20 bg-white/10 backdrop-blur-sm">
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-center py-8 relative z-10">
          <p className="text-sm text-muted-foreground font-light">No ranking data available</p>
          <p className="text-xs text-muted-foreground font-light">Start making predictions to see model rankings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card hover-lift p-6 space-y-6 relative overflow-hidden group">
      {/* Subtle glare effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex items-center justify-between relative z-10">
        <h2 className="text-lg font-light text-foreground">Model Rankings</h2>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32 h-8 glass-card border-white/20 bg-white/10 backdrop-blur-sm text-sm rounded-lg font-light hover:bg-white/20 transition-all duration-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-card border-white/20 bg-white/10 backdrop-blur-sm">
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 relative z-10">
        {rankings.map((ranking, index) => (
          <motion.div
            key={ranking.aiModel.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex items-center justify-between py-3 px-4 hover:bg-gray-50/50 transition-all duration-300 group/item"
          >

            <div className="flex items-center space-x-3 relative z-10">
              <span className="text-sm text-muted-foreground font-light">
                #{ranking.rank}
              </span>
              <div className={`w-2 h-2 rounded-full shadow-sm ${ranking.aiModel.name === 'Claude' ? 'bg-green-500 shadow-green-500/50' :
                  ranking.aiModel.name === 'ChatGPT' ? 'bg-blue-500 shadow-blue-500/50' :
                    ranking.aiModel.name === 'Deepseek' ? 'bg-purple-500 shadow-purple-500/50' :
                      'bg-gray-500 shadow-gray-500/50'
                }`}></div>
              <span className="text-sm font-light text-foreground">{ranking.aiModel.name}</span>
            </div>

            <div className="text-right relative z-10">
              <div className="text-base font-light text-foreground">
                {ranking.accuracy.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground font-light">Accuracy</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground font-light pt-4 border-t border-white/20 relative z-10">
        <span>Based on predictions across all commodities</span>
        <span>Best performer: {rankings?.[0]?.accuracy?.toFixed(1) || '0.0'}% accuracy</span>
      </div>
    </div>
  );
}