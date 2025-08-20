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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Prediction Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 flex items-center justify-center">
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-muted-foreground mx-auto opacity-30"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Prediction Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xl font-semibold text-foreground">
              {stats?.totalPredictions || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              Total Predictions
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-foreground">
              {stats?.activeModels || 3}
            </div>
            <div className="text-xs text-muted-foreground">
              AI Models
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Coverage</span>
            <span className="text-xs font-medium">14 Commodities</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Recent Activity</span>
            {stats?.totalPredictions === 0 ? (
              <span className="text-xs text-muted-foreground">Pending</span>
            ) : (
              <span className="text-xs text-green-600 dark:text-green-400">Active</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}