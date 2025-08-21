import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, AlertCircle, Activity } from 'lucide-react';

interface CompositeIndex {
  id: string;
  date: string;
  overallIndex: string;
  hardCommoditiesIndex: string;
  softCommoditiesIndex: string;
  directionalComponent: string;
  confidenceComponent: string;
  accuracyComponent: string;
  momentumComponent: string;
  totalPredictions: number;
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  createdAt: string;
}

interface CompositeIndexGaugeProps {
  className?: string;
}

export function CompositeIndexGauge({ className }: CompositeIndexGaugeProps) {
  const [latestIndex, setLatestIndex] = useState<CompositeIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLatestIndex();
  }, []);

  const fetchLatestIndex = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/composite-index/latest');
      if (response.ok) {
        const data = await response.json();
        setLatestIndex(data);
        setError(null);
      } else if (response.status === 404) {
        setError('No index data available');
      } else {
        throw new Error('Failed to fetch composite index');
      }
    } catch (err) {
      setError('Failed to load composite index');
      console.error('Error fetching composite index:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string): string => {
    switch (sentiment) {
      case 'bullish': return 'text-green-600 dark:text-green-400';
      case 'bearish': return 'text-red-600 dark:text-red-400';
      default: return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  const getSentimentBadgeVariant = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'default';
      case 'bearish': return 'destructive';
      default: return 'secondary';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="h-4 w-4" />;
      case 'bearish': return <TrendingDown className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const getIndexDescription = (value: number): string => {
    if (value >= 70) return 'Extreme AI Optimism';
    if (value >= 55) return 'AI Bullish';
    if (value >= 45) return 'AI Neutral/Mixed';
    if (value >= 30) return 'AI Bearish';
    return 'Extreme AI Pessimism';
  };

  if (loading) {
    return (
      <Card className={`${className} border-0 shadow-sm bg-white dark:bg-slate-900 h-[280px]`}>
        <CardHeader className="pb-4 space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Composite Index</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col justify-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative">
              <div className="w-12 h-12 border-2 border-dashed border-amber-300 dark:border-amber-600 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Initializing Market Data
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !latestIndex) {
    return (
      <Card className={`${className} border-0 shadow-sm bg-white dark:bg-slate-900 h-[280px]`}>
        <CardHeader className="pb-4 space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Composite Index</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col justify-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative">
              <div className="w-12 h-12 border-2 border-dashed border-amber-300 dark:border-amber-600 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Initializing Market Data
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const indexValue = parseFloat(latestIndex.overallIndex);
  const hardIndex = parseFloat(latestIndex.hardCommoditiesIndex);
  const softIndex = parseFloat(latestIndex.softCommoditiesIndex);

  // Calculate gauge position (0-100 scale)
  const gaugePosition = Math.max(0, Math.min(100, indexValue));
  const gaugeRotation = (gaugePosition / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <Card className={`${className} border-0 shadow-sm bg-white dark:bg-slate-900 h-[280px] flex flex-col`}>
      <CardHeader className="pb-3 space-y-1">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-500" />
          <CardTitle className="text-sm font-medium text-muted-foreground">
            AI Composite Index
          </CardTitle>
          <Badge variant={getSentimentBadgeVariant(latestIndex.marketSentiment)} className="ml-auto text-xs px-2 py-0.5">
            {latestIndex.marketSentiment.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 flex-1 flex flex-col space-y-4">
        {/* Compact Gauge */}
        <div className="text-center space-y-3">
          <div className={`text-4xl font-bold ${getSentimentColor(latestIndex.marketSentiment)}`}>
            {indexValue.toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground">
            {getIndexDescription(indexValue)}
          </div>
          <div className="w-full bg-muted/30 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-700"
              style={{ width: `${gaugePosition}%` }}
            />
          </div>
        </div>

        {/* Compact Sub-indices */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center space-y-1">
            <div className="text-lg font-semibold text-foreground">
              {hardIndex.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">
              Hard Commodities
            </div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-lg font-semibold text-foreground">
              {softIndex.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">
              Soft Commodities
            </div>
          </div>
        </div>

        {/* Compact metadata */}
        <div className="text-center mt-auto">
          <div className="text-xs text-muted-foreground">
            {latestIndex.totalPredictions} predictions analyzed
          </div>
        </div>
      </CardContent>
    </Card>
  );
}