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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Market Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 flex items-center justify-center">
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-muted-foreground mx-auto opacity-30"></div>
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Market Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Current Status</span>
          <span className={`text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Data Source</span>
            <span className="text-xs font-medium">Yahoo Finance</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Freshness</span>
            <span className="text-xs font-medium">{status?.dataFreshness}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Schedule</span>
            <span className="text-xs font-medium">{status?.nextUpdate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}