import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState } from "react";
import type { AiModel } from "@shared/schema";

interface OverallModelRanking {
  rank: number;
  aiModel: AiModel;
  overallAccuracy: number;
  totalPredictions: number;
  trend: number; // 1 for up, -1 for down, 0 for stable
  avgAbsoluteError: number;
  commodityPerformance: Array<{
    commodity: string;
    accuracy: number;
    predictions: number;
  }>;
}

export default function OverallModelRankings() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  const { data: rankings, isLoading } = useQuery<OverallModelRanking[]>({
    queryKey: ["/api/league-table", selectedPeriod],
    enabled: true,
  });

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getRankBadge = (rank: number) => {
    const baseClasses = "text-sm font-semibold px-3 py-1 rounded-full";
    switch (rank) {
      case 1:
        return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`}>#{rank}</span>;
      case 2:
        return <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400`}>#{rank}</span>;
      case 3:
        return <span className={`${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400`}>#{rank}</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400`}>#{rank}</span>;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Model Rankings</h2>
          <div className="w-32 h-10 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (!rankings || rankings.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Model Rankings</h2>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 opacity-20">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-muted-foreground">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 10.31c5.16-.57 9-4.76 9-10.31V7l-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No ranking data available</h3>
          <p className="text-sm text-muted-foreground">Start making predictions to see model rankings</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Model Rankings</h2>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {rankings.map((ranking) => (
          <div 
            key={ranking.aiModel.id} 
            className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/30 hover:bg-card/50 transition-colors"
          >
            {/* Left side: Rank and model info */}
            <div className="flex items-center space-x-4">
              {getRankBadge(ranking.rank)}
              
              <div className="flex items-center space-x-3">
                <span 
                  className={`w-4 h-4 rounded-full ${
                    ranking.aiModel.name === 'Claude' ? 'bg-green-500' :
                    ranking.aiModel.name === 'ChatGPT' ? 'bg-blue-500' :
                    ranking.aiModel.name === 'Deepseek' ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`}
                />
                <div>
                  <div className="font-semibold text-foreground">{ranking.aiModel.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {ranking.totalPredictions} predictions
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Performance metrics */}
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">
                  {ranking.overallAccuracy.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </div>
              
              <div className="flex items-center space-x-2">
                {getTrendIcon(ranking.trend)}
                <span className="text-sm text-muted-foreground">
                  {ranking.trend > 0 ? "Rising" : ranking.trend < 0 ? "Falling" : "Stable"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary footer */}
      <div className="mt-6 pt-4 border-t border-border/30">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Based on predictions across all commodities</span>
          <span>Best performer: {rankings[0]?.overallAccuracy.toFixed(1)}% accuracy</span>
        </div>
      </div>
    </Card>
  );
}