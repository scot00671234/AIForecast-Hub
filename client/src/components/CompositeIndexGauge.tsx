import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';

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
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">AI Commodity Composite Index</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 flex items-center justify-center">
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-muted-foreground mx-auto opacity-30"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !latestIndex) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">AI Commodity Composite Index</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 flex flex-col items-center justify-center">
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-muted-foreground mx-auto mb-2 opacity-30"></div>
            <p className="text-xs text-muted-foreground">
              Awaiting predictions
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
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Commodity Composite Index (ACCI)</span>
          <Badge 
            variant={getSentimentBadgeVariant(latestIndex.marketSentiment)}
            className="flex items-center gap-1"
          >
            {getSentimentIcon(latestIndex.marketSentiment)}
            {latestIndex.marketSentiment.toUpperCase()}
          </Badge>
        </CardTitle>
        <CardDescription>
          PMI-style aggregation of all AI model predictions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Gauge */}
        <div className="relative mx-auto w-48 h-24">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            {/* Background Arc */}
            <path
              d="M 20 80 A 80 80 0 0 1 180 80"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="opacity-20"
            />
            
            {/* Color Segments */}
            <path d="M 20 80 A 80 80 0 0 0 60 20" fill="none" stroke="#ef4444" strokeWidth="8" className="opacity-60" />
            <path d="M 60 20 A 80 80 0 0 0 100 10" fill="none" stroke="#f59e0b" strokeWidth="8" className="opacity-60" />
            <path d="M 100 10 A 80 80 0 0 0 140 20" fill="none" stroke="#22c55e" strokeWidth="8" className="opacity-60" />
            <path d="M 140 20 A 80 80 0 0 0 180 80" fill="none" stroke="#16a34a" strokeWidth="8" className="opacity-60" />
            
            {/* Needle */}
            <g transform={`rotate(${gaugeRotation} 100 80)`}>
              <line
                x1="100"
                y1="80"
                x2="100"
                y2="30"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="100" cy="80" r="4" fill="currentColor" />
            </g>
            
            {/* Scale Labels */}
            <text x="20" y="95" textAnchor="start" className="text-xs fill-current">0</text>
            <text x="60" y="25" textAnchor="middle" className="text-xs fill-current">30</text>
            <text x="100" y="15" textAnchor="middle" className="text-xs fill-current">50</text>
            <text x="140" y="25" textAnchor="middle" className="text-xs fill-current">70</text>
            <text x="180" y="95" textAnchor="end" className="text-xs fill-current">100</text>
          </svg>
          
          {/* Center Value */}
          <div className="absolute inset-x-0 bottom-0 text-center">
            <div className={`text-2xl font-bold ${getSentimentColor(latestIndex.marketSentiment)}`}>
              {indexValue.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">
              {getIndexDescription(indexValue)}
            </div>
          </div>
        </div>

        {/* Sub-indices */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-muted-foreground">Hard Commodities</div>
            <div className="text-lg font-bold">{hardIndex.toFixed(1)}</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-muted-foreground">Soft Commodities</div>
            <div className="text-lg font-bold">{softIndex.toFixed(1)}</div>
          </div>
        </div>

        {/* Components Breakdown */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Directional:</span>
            <span>{parseFloat(latestIndex.directionalComponent).toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Confidence:</span>
            <span>{parseFloat(latestIndex.confidenceComponent).toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Accuracy:</span>
            <span>{parseFloat(latestIndex.accuracyComponent).toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Momentum:</span>
            <span>{parseFloat(latestIndex.momentumComponent).toFixed(1)}</span>
          </div>
        </div>

        {/* Metadata */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Based on {latestIndex.totalPredictions} predictions • Updated {new Date(latestIndex.date).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}