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
      return (
        <div className="bg-background/95 border border-border rounded-lg p-4 shadow-lg backdrop-blur-sm">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto glass-card">
        <DialogHeader className="border-b border-border-subtle pb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-3xl font-bold tracking-tight flex items-center space-x-3">
                <Activity className="w-8 h-8 text-primary" />
                <span>{commodity.name} Price Analysis</span>
              </DialogTitle>
              <div className="flex items-center space-x-6">
                <p className="text-sm text-muted-foreground">
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{commodity.symbol}</span>
                </p>
                {latestPrice && (
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl font-bold text-foreground">
                      {formatPrice(latestPrice.price)}
                    </span>
                    {latestPrice.changePercent && formatChange(latestPrice.changePercent)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Time Period Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Time Period</h3>
            <div className="space-y-3">
              {Object.entries(groupedPeriods).map(([group, periods]) => (
                <div key={group} className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{group} Term</p>
                  <div className="flex flex-wrap gap-2">
                    {periods.map(period => (
                      <Button
                        key={period.value}
                        variant={selectedPeriod === period.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPeriod(period.value)}
                        className="micro-transition"
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Price Movement & AI Predictions</h3>
            {chartLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-96 w-full rounded-xl" />
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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