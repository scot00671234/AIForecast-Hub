import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Brain, Target } from 'lucide-react';

interface PredictionStats {
  totalPredictions: number;
  activeModels: number;
  averageConfidence: number;
  recentPredictions: number;
}

export default function PredictionStatsCard() {
  const [stats, setStats] = useState<PredictionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Get dashboard stats
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const dashboardStats = await response.json();
        
        // Get AI models to count active ones
        const modelsResponse = await fetch('/api/ai-models');
        const models = modelsResponse.ok ? await modelsResponse.json() : [];
        
        setStats({
          totalPredictions: dashboardStats.totalPredictions || 0,
          activeModels: models.filter((m: any) => m.isActive).length || 3,
          averageConfidence: dashboardStats.avgAccuracy || 0,
          recentPredictions: dashboardStats.totalPredictions || 0
        });
      }
    } catch (err) {
      console.error('Error fetching prediction stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl h-[280px] flex flex-col relative overflow-hidden group">
        {/* Subtle glare effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardHeader className="pb-4 relative z-10">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-foreground">Prediction Stats</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex items-center justify-center relative z-10">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-sm text-muted-foreground">Loading stats...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card hover-lift shimmer h-[280px] flex flex-col relative overflow-hidden group">
      {/* Enhanced cursor-like glare effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {/* Cursor sweep effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400" />
      {/* Additional cursor glare */}
      <div className="absolute inset-0 bg-gradient-to-tl from-white/20 via-transparent to-white/15 opacity-0 group-hover:opacity-100 transition-all duration-500" />
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium text-foreground">Prediction Stats</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col space-y-6 relative z-10">
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-foreground">
              {stats?.totalPredictions || 0}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              Total Predictions
            </div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-foreground">
              {stats?.activeModels || 3}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              AI Models
            </div>
          </div>
        </div>
        
        <div className="space-y-3 flex-1">
          <div className="flex justify-between items-center py-2 border-b border-border/30">
            <span className="text-xs text-muted-foreground font-medium">Coverage</span>
            <span className="text-xs font-semibold text-foreground">14 Commodities</span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-xs text-muted-foreground font-medium">Recent Activity</span>
            {stats?.totalPredictions === 0 ? (
              <div className="px-2 py-1 bg-muted/50 text-muted-foreground text-xs rounded-full font-medium">Pending</div>
            ) : (
              <div className="px-2 py-1 bg-muted/50 text-foreground text-xs rounded-full font-medium">Active</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}