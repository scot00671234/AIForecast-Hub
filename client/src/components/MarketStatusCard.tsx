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
        <CardHeader>
          <CardTitle>Market Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Market Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Status</span>
          <Badge 
            variant={status?.isMarketOpen && status?.systemHealth === 'healthy' ? 'default' : 'secondary'}
            className={`flex items-center gap-1 ${getStatusColor()}`}
          >
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Data Source</span>
            <span className="text-sm font-medium">Yahoo Finance</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Freshness</span>
            <span className="text-sm font-medium">{status?.dataFreshness}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Schedule</span>
            <span className="text-xs text-muted-foreground">{status?.nextUpdate}</span>
          </div>
        </div>
        
        {(!status?.isMarketOpen || status?.systemHealth !== 'healthy') && (
          <div className="text-center py-2">
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-foreground mx-auto mb-2 opacity-20"></div>
            <p className="text-xs text-muted-foreground">
              {status?.systemHealth === 'error' ? 'System maintenance' : 'Off-market hours'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}