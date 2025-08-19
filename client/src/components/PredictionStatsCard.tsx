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
        <CardHeader>
          <CardTitle>Prediction Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Prediction Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {stats?.totalPredictions || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              Total Predictions
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {stats?.activeModels || 3}
            </div>
            <div className="text-xs text-muted-foreground">
              AI Models
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Coverage</span>
            <Badge variant="secondary" className="text-xs">
              14 Commodities
            </Badge>
          </div>
          
          {stats?.totalPredictions === 0 ? (
            <div className="text-center py-2">
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-foreground mx-auto mb-2 opacity-20"></div>
              <p className="text-xs text-muted-foreground">
                Awaiting first predictions
              </p>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Recent Activity</span>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs">Active</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}