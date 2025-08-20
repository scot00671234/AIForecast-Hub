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
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4 space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">Prediction Stats</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-24 flex items-center justify-center">
            <div className="animate-pulse">
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-muted-foreground/40"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4 space-y-1">
        <CardTitle className="text-sm font-medium text-muted-foreground">Prediction Stats</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center space-y-1">
            <div className="text-2xl font-semibold text-foreground">
              {stats?.totalPredictions || 0}
            </div>
            <div className="text-xs text-muted-foreground/70">
              Total Predictions
            </div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-semibold text-foreground">
              {stats?.activeModels || 3}
            </div>
            <div className="text-xs text-muted-foreground/70">
              AI Models
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-muted-foreground">Coverage</span>
            <span className="text-xs font-medium text-foreground">14 Commodities</span>
          </div>
          
          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-muted-foreground">Recent Activity</span>
            {stats?.totalPredictions === 0 ? (
              <span className="text-xs text-muted-foreground/70">Pending</span>
            ) : (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Active</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}