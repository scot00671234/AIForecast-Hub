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
    queryKey: ["/api/commodities", commodity.id, "detailed-chart", selectedPeriod],
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

  const formattedData = chartData?.map(point => ({
    date: new Date(point.date).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: selectedPeriod.includes('y') ? "2-digit" : undefined
    }),
    actualPrice: point.actualPrice,
    ...Object.keys(point.predictions).reduce((acc, modelId) => {
      const model = aiModels.find(m => m.id === modelId);
      if (model) {
        acc[model.name] = point.predictions[modelId];
      }
      return acc;
    }, {} as Record<string, number>)
  })) || [];

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

        <div className="space-y-8 py-8">
          {/* Time Period Selection */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">Time Period</h3>
              <div className="text-sm text-muted-foreground">
                Select timeframe for analysis
              </div>
            </div>
            <div className="grid grid-cols-3 gap-8">
              {Object.entries(groupedPeriods).map(([group, periods]) => (
                <div key={group} className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pb-2">{group} TERM</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {periods.map(period => (
                      <Button
                        key={period.value}
                        variant={selectedPeriod === period.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPeriod(period.value)}
                        className="micro-transition w-full justify-center font-medium"
                      >
                        {period.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Chart */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">Price Movement & AI Predictions</h3>
              <div className="text-sm text-muted-foreground">
                Interactive price analysis with AI model predictions
              </div>
            </div>
            {chartLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-[500px] w-full rounded-xl" />
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                <div className="h-[500px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      
                      {/* Actual Price Line */}
                      <Line
                        type="monotone"
                        dataKey="actualPrice"
                        stroke="hsl(var(--foreground))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--foreground))", strokeWidth: 2, r: 4 }}
                        name="Actual Price"
                      />
                      
                      {/* AI Model Prediction Lines */}
                      {aiModels?.map(model => (
                        <Line
                          key={model.id}
                          type="monotone"
                          dataKey={`predictions.${model.id}`}
                          stroke={aiModelColors[model.name as keyof typeof aiModelColors] || model.color}
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ fill: aiModelColors[model.name as keyof typeof aiModelColors] || model.color, strokeWidth: 2, r: 3 }}
                          name={`${model.name} Prediction`}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Market Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">Volatility</h4>
              <p className="text-2xl font-bold text-primary">12.5%</p>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">Volume</h4>
              <p className="text-2xl font-bold text-primary">2.8M</p>
              <p className="text-xs text-muted-foreground">Average daily</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">Prediction Accuracy</h4>
              <p className="text-2xl font-bold text-primary">84.2%</p>
              <p className="text-xs text-muted-foreground">Best performing model</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}