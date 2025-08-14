import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import type { ChartDataPoint, Commodity, AiModel, TimePeriod, LatestPrice } from "@shared/schema";

interface EnhancedChartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  commodity: Commodity;
  aiModels: AiModel[];
}

const TIME_PERIODS: Array<{ value: TimePeriod; label: string; group: string }> = [
  { value: "1d", label: "1D", group: "Short" },
  { value: "5d", label: "5D", group: "Short" },
  { value: "1w", label: "1W", group: "Short" },
  { value: "1mo", label: "1M", group: "Medium" },
  { value: "3mo", label: "3M", group: "Medium" },
  { value: "6mo", label: "6M", group: "Medium" },
  { value: "1y", label: "1Y", group: "Long" },
  { value: "2y", label: "2Y", group: "Long" },
  { value: "5y", label: "5Y", group: "Long" },
];

export default function EnhancedChartDialog({ isOpen, onClose, commodity, aiModels }: EnhancedChartDialogProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("1mo");

  const { data: chartData, isLoading: chartLoading } = useQuery<ChartDataPoint[]>({
    queryKey: [`/api/commodities/${commodity.id}/detailed-chart`, selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/commodities/${commodity.id}/detailed-chart?period=${selectedPeriod}`);
      if (!response.ok) throw new Error('Failed to fetch chart data');
      return response.json();
    },
    enabled: isOpen && !!commodity.id,
  });

  const { data: latestPrice } = useQuery<LatestPrice>({
    queryKey: ["/api/commodities", commodity.id, "latest-price"],
    enabled: isOpen && !!commodity.id,
  });

  const { data: realTimeData } = useQuery({
    queryKey: ["/api/commodities", commodity.id, "realtime", selectedPeriod],
    enabled: isOpen && !!commodity.id,
    refetchInterval: selectedPeriod === "1d" ? 30000 : 300000, // More frequent updates for shorter periods
  });

  const aiModelColors = {
    "Claude": "#10B981",
    "ChatGPT": "#3B82F6", 
    "Deepseek": "#8B5CF6"
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formattedData = chartData?.map(point => {
    const dataPoint: any = {
      date: point.date,
      actualPrice: point.actualPrice,
    };
    
    // Add predictions using model names as keys for Recharts
    if (point.predictions && aiModels) {
      Object.keys(point.predictions).forEach(modelId => {
        const model = aiModels.find(m => m.id === modelId);
        if (model) {
          dataPoint[model.name] = point.predictions[modelId];
        }
      });
    }
    
    return dataPoint;
  }) || [];



  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
        {isPositive ? '+' : ''}{change.toFixed(2)}%
      </span>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const actualPrice = payload.find((p: any) => p.dataKey === 'actualPrice');
      const predictions = payload.filter((p: any) => p.dataKey !== 'actualPrice');
      
      return (
        <div className="bg-background/95 border border-border rounded-lg p-4 shadow-lg backdrop-blur-sm">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          
          {actualPrice && (
            <div className="mb-3 pb-2 border-b border-border">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-foreground" />
                  <span className="text-sm font-medium text-foreground">Actual (Yahoo Finance)</span>
                </div>
                <span className="font-bold text-foreground">
                  {formatPrice(actualPrice.value)}
                </span>
              </div>
            </div>
          )}

          {predictions.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground mb-2">AI Predictions:</p>
              {predictions.map((entry: any, index: number) => (
                <div key={index} className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-muted-foreground">{entry.name}</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {formatPrice(entry.value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const groupedPeriods = TIME_PERIODS.reduce((acc, period) => {
    if (!acc[period.group]) acc[period.group] = [];
    acc[period.group].push(period);
    return acc;
  }, {} as Record<string, typeof TIME_PERIODS>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto glass-card">
        <DialogHeader className="border-b border-border-subtle pb-8">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <DialogTitle className="text-3xl font-bold tracking-tight flex items-center space-x-3">
                <Activity className="w-8 h-8 text-primary" />
                <span>{commodity.name} Price Analysis</span>
              </DialogTitle>
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-muted-foreground">Symbol:</span>
                  <span className="font-mono text-sm bg-muted px-3 py-1 rounded-md font-medium">{commodity.symbol}</span>
                </div>
                {latestPrice && (
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-3xl font-bold text-foreground">
                        {formatPrice(latestPrice.price)}
                      </div>
                      <div className="text-sm text-muted-foreground">Current Price</div>
                    </div>
                    {latestPrice.changePercent && (
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {formatChange(latestPrice.changePercent)}
                        </div>
                        <div className="text-xs text-muted-foreground">24h Change</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-8">
          {/* Trading Platform Style Chart */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">Price Movement & AI Predictions</h3>
              
              {/* Integrated Time Period Controls */}
              <div className="flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
                {TIME_PERIODS.map(period => (
                  <Button
                    key={period.value}
                    variant={selectedPeriod === period.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedPeriod(period.value)}
                    className={`
                      h-7 px-3 text-xs font-medium transition-all duration-200
                      ${selectedPeriod === period.value 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                      }
                    `}
                  >
                    {period.label}
                  </Button>
                ))}
              </div>
            </div>
            {chartLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-[500px] w-full rounded-xl" />
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                {/* Chart Toolbar */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-muted/30">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-0.5 bg-black"></div>
                        <span className="text-sm font-medium">Actual Price</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-0.5 bg-[#10B981] border-dashed border-t-2 border-[#10B981]"></div>
                        <span className="text-sm text-muted-foreground">Claude</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-0.5 bg-[#3B82F6] border-dashed border-t-2 border-[#3B82F6]"></div>
                        <span className="text-sm text-muted-foreground">ChatGPT</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-0.5 bg-[#8B5CF6] border-dashed border-t-2 border-[#8B5CF6]"></div>
                        <span className="text-sm text-muted-foreground">Deepseek</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Data from Yahoo Finance • Updated {new Date().toLocaleTimeString()}
                  </div>
                </div>
                
                <div className="h-[500px] w-full p-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formattedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      {/* Very minimal grid */}
                      <CartesianGrid strokeDasharray="1 1" stroke="currentColor" className="opacity-5" />
                      
                      {/* Hide axes for clean sparkline look */}
                      <XAxis 
                        dataKey="date" 
                        axisLine={false}
                        tickLine={false}
                        tick={false}
                        height={0}
                      />
                      <YAxis 
                        hide
                        domain={['dataMin - 5', 'dataMax + 5']}
                      />
                      
                      {/* Actual Price Line - clean and thin */}
                      <Line
                        type="monotone"
                        dataKey="actualPrice"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={false}
                        name="Actual Price"
                        connectNulls={true}
                      />
                      
                      {/* AI Model Prediction Lines - very subtle */}
                      {aiModels?.map(model => (
                        <Line
                          key={model.id}
                          type="monotone"
                          dataKey={model.name}
                          stroke={aiModelColors[model.name as keyof typeof aiModelColors] || "#999999"}
                          strokeWidth={1}
                          strokeDasharray="2 2"
                          dot={false}
                          name={`${model.name}`}
                          connectNulls={true}
                          strokeOpacity={0.6}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Market Insights - Trading Platform Style */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">30D VOLATILITY</div>
              <div className="text-lg font-bold text-orange-500">12.5%</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">AVG VOLUME</div>
              <div className="text-lg font-bold text-blue-500">2.8M</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">BEST MODEL</div>
              <div className="text-lg font-bold text-green-500">Deepseek</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">ACCURACY</div>
              <div className="text-lg font-bold text-primary">84.2%</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}