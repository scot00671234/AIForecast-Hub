import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface MarketStatus {
  isMarketOpen: boolean;
  nextUpdate: string;
  dataFreshness: string;
  systemHealth: 'healthy' | 'warning' | 'error';
}

export default function MarketStatusCard() {
  const [status, setStatus] = useState<MarketStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    // Update every minute
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      
      // Determine if market hours (9 AM - 5 PM EST, Mon-Fri)
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      const isWeekday = day >= 1 && day <= 5;
      const isMarketHours = hour >= 9 && hour <= 17;
      const isMarketOpen = isWeekday && isMarketHours;
      
      // Next update time
      let nextUpdate = 'Next hourly update';
      if (!isMarketOpen) {
        if (isWeekday && hour < 9) {
          nextUpdate = 'Market opens 9 AM';
        } else if (isWeekday && hour > 17) {
          nextUpdate = 'Market opens 9 AM tomorrow';
        } else {
          nextUpdate = 'Market opens Monday 9 AM';
        }
      }
      
      setStatus({
        isMarketOpen,
        nextUpdate,
        dataFreshness: 'Real-time',
        systemHealth: 'healthy'
      });
    } catch (err) {
      console.error('Error fetching market status:', err);
      setStatus({
        isMarketOpen: false,
        nextUpdate: 'System check required',
        dataFreshness: 'Unknown',
        systemHealth: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4 space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">Market Status</CardTitle>
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

  const getStatusColor = () => {
    if (status?.systemHealth === 'error') return 'text-red-600 dark:text-red-400';
    if (!status?.isMarketOpen) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getStatusIcon = () => {
    if (status?.systemHealth === 'error') return <AlertCircle className="h-4 w-4" />;
    if (!status?.isMarketOpen) return <Clock className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (status?.systemHealth === 'error') return 'System Issues';
    if (!status?.isMarketOpen) return 'Market Closed';
    return 'Market Open';
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4 space-y-1">
        <CardTitle className="text-sm font-medium text-muted-foreground">Market Status</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-6">
        <div className="flex items-center justify-between py-2">
          <span className="text-xs text-muted-foreground">Current Status</span>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor()} ${
            status?.isMarketOpen && status?.systemHealth === 'healthy' 
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' 
              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
          }`}>
            {getStatusText()}
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-muted-foreground">Data Source</span>
            <span className="text-xs font-medium text-foreground">Yahoo Finance</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-muted-foreground">Freshness</span>
            <span className="text-xs font-medium text-foreground">{status?.dataFreshness}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-muted-foreground">Schedule</span>
            <span className="text-xs font-medium text-foreground">{status?.nextUpdate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}