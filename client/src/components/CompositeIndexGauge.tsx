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
      <Card className={`${className} border-0 shadow-sm bg-white dark:bg-slate-900`}>
        <CardHeader className="pb-4 space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Composite Index</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-32 flex flex-col items-center justify-center space-y-3">
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
      <Card className={`${className} border-0 shadow-sm bg-white dark:bg-slate-900`}>
        <CardHeader className="pb-4 space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Composite Index</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-32 flex flex-col items-center justify-center space-y-3">
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
    <Card className={`${className} border-0 shadow-sm bg-white dark:bg-slate-900`}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse"></div>
      </div>
      
      <CardHeader className="pb-4 space-y-1 relative z-10">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Activity className="h-4 w-4 text-blue-500 group-hover:text-blue-400 transition-colors duration-300" />
            <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping group-hover:animate-pulse"></div>
          </div>
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors duration-300">
            AI Composite Index
          </CardTitle>
          <Badge variant={getSentimentBadgeVariant(latestIndex.marketSentiment)} className="ml-auto text-xs px-2 py-0.5 animate-pulse">
            {latestIndex.marketSentiment.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-6 relative z-10">
        {/* Modern Circular Gauge */}
        <div className="relative mx-auto w-52 h-28 group-hover:scale-105 transition-transform duration-500">
          <svg viewBox="0 0 220 110" className="w-full h-full drop-shadow-lg">
            <defs>
              {/* Gradient definitions for modern look */}
              <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
              <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#15803d" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Background Track */}
            <path
              d="M 25 85 A 85 85 0 0 1 195 85"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="opacity-10"
            />
            
            {/* Colored Segments with gradients */}
            <path d="M 25 85 A 85 85 0 0 0 70 25" fill="none" stroke="url(#redGradient)" strokeWidth="10" className="opacity-80" />
            <path d="M 70 25 A 85 85 0 0 0 110 15" fill="none" stroke="url(#yellowGradient)" strokeWidth="10" className="opacity-80" />
            <path d="M 110 15 A 85 85 0 0 0 150 25" fill="none" stroke="url(#greenGradient)" strokeWidth="10" className="opacity-80" />
            <path d="M 150 25 A 85 85 0 0 0 195 85" fill="none" stroke="url(#greenGradient)" strokeWidth="10" className="opacity-80" />
            
            {/* Scale markers */}
            {[0, 25, 50, 75, 100].map((value, index) => {
              const angle = (value / 100) * 180 - 90;
              const radian = (angle * Math.PI) / 180;
              const x1 = 110 + 75 * Math.cos(radian);
              const y1 = 85 + 75 * Math.sin(radian);
              const x2 = 110 + 85 * Math.cos(radian);
              const y2 = 85 + 85 * Math.sin(radian);
              return (
                <line key={value} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="2" className="opacity-40" />
              );
            })}
            
            {/* Animated Needle */}
            <g transform={`rotate(${gaugeRotation} 110 85)`} className="group-hover:drop-shadow-lg transition-all duration-700 ease-out" filter="url(#glow)">
              <line
                x1="110"
                y1="85"
                x2="110"
                y2="25"
                stroke="#3b82f6"
                strokeWidth="4"
                strokeLinecap="round"
                className="group-hover:stroke-blue-400 transition-colors duration-300"
              />
              <circle cx="110" cy="85" r="6" fill="#3b82f6" className="group-hover:fill-blue-400 transition-colors duration-300" />
              <circle cx="110" cy="85" r="3" fill="white" />
            </g>
            
            {/* Scale Labels */}
            <text x="25" y="100" textAnchor="start" className="text-xs font-semibold fill-slate-500 dark:fill-slate-400">0</text>
            <text x="70" y="30" textAnchor="middle" className="text-xs font-semibold fill-slate-500 dark:fill-slate-400">25</text>
            <text x="110" y="20" textAnchor="middle" className="text-xs font-semibold fill-slate-500 dark:fill-slate-400">50</text>
            <text x="150" y="30" textAnchor="middle" className="text-xs font-semibold fill-slate-500 dark:fill-slate-400">75</text>
            <text x="195" y="100" textAnchor="end" className="text-xs font-semibold fill-slate-500 dark:fill-slate-400">100</text>
          </svg>
          
          {/* Center Value Display */}
          <div className="absolute inset-x-0 bottom-2 text-center">
            <div className={`text-3xl font-bold ${getSentimentColor(latestIndex.marketSentiment)} group-hover:scale-110 transition-transform duration-300 drop-shadow-sm`}>
              {indexValue.toFixed(1)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
              {getIndexDescription(indexValue)}
            </div>
          </div>
        </div>

        {/* Sub-indices with modern styling */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative group/hard p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200/50 dark:border-orange-800/50 hover:shadow-md transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-xl opacity-0 group-hover/hard:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 text-center">
              <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-1 uppercase tracking-wide">Hard Commodities</div>
              <div className="text-xl font-bold text-orange-700 dark:text-orange-300 group-hover/hard:scale-105 transition-transform duration-300">
                {hardIndex.toFixed(1)}
              </div>
              <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-1.5 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${hardIndex}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="relative group/soft p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-md transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 rounded-xl opacity-0 group-hover/soft:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 text-center">
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wide">Soft Commodities</div>
              <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 group-hover/soft:scale-105 transition-transform duration-300">
                {softIndex.toFixed(1)}
              </div>
              <div className="w-full bg-emerald-200 dark:bg-emerald-800 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-green-500 h-1.5 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${softIndex}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Components Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative group/comp p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-900/20 border border-blue-200/30 dark:border-blue-800/30 hover:shadow-sm transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Directional</span>
              <span className="text-sm font-bold text-blue-700 dark:text-blue-300 group-hover/comp:scale-105 transition-transform duration-300">
                {parseFloat(latestIndex.directionalComponent).toFixed(1)}
              </span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1 mt-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${parseFloat(latestIndex.directionalComponent)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="relative group/comp p-3 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/10 dark:to-purple-900/20 border border-purple-200/30 dark:border-purple-800/30 hover:shadow-sm transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">Confidence</span>
              <span className="text-sm font-bold text-purple-700 dark:text-purple-300 group-hover/comp:scale-105 transition-transform duration-300">
                {parseFloat(latestIndex.confidenceComponent).toFixed(1)}
              </span>
            </div>
            <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-1 mt-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-1 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${parseFloat(latestIndex.confidenceComponent)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="relative group/comp p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/10 dark:to-green-900/20 border border-green-200/30 dark:border-green-800/30 hover:shadow-sm transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Accuracy</span>
              <span className="text-sm font-bold text-green-700 dark:text-green-300 group-hover/comp:scale-105 transition-transform duration-300">
                {parseFloat(latestIndex.accuracyComponent).toFixed(1)}
              </span>
            </div>
            <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-1 mt-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-1 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${parseFloat(latestIndex.accuracyComponent)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="relative group/comp p-3 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/10 dark:to-amber-900/20 border border-amber-200/30 dark:border-amber-800/30 hover:shadow-sm transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">Momentum</span>
              <span className="text-sm font-bold text-amber-700 dark:text-amber-300 group-hover/comp:scale-105 transition-transform duration-300">
                {parseFloat(latestIndex.momentumComponent).toFixed(1)}
              </span>
            </div>
            <div className="w-full bg-amber-200 dark:bg-amber-800 rounded-full h-1 mt-2">
              <div 
                className="bg-gradient-to-r from-amber-500 to-amber-600 h-1 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${parseFloat(latestIndex.momentumComponent)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Enhanced Metadata */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="font-medium">
              {latestIndex.totalPredictions} predictions analyzed
            </span>
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Updated {new Date(latestIndex.date).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}