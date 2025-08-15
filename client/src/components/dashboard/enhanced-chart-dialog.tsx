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
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-background border border-border/50 backdrop-blur-md">
        <DialogHeader className="border-b border-border/30 pb-8">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <DialogTitle className="text-2xl md:text-3xl font-normal tracking-wide flex items-center space-x-3">
                {/* Triangle icon matching the logo */}
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-primary"></div>
                <span>{commodity.name} Price Analysis</span>
              </DialogTitle>
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-muted-foreground font-light">Symbol:</span>
                  <span className="font-mono text-sm bg-muted/50 px-3 py-1 rounded-md font-medium border border-border/50">{commodity.symbol}</span>
                </div>
                {latestPrice && (
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-2xl md:text-3xl font-normal text-foreground">
                        {formatPrice(latestPrice.price)}
                      </div>
                      <div className="text-sm text-muted-foreground font-light">Current Price</div>
                    </div>
                    {latestPrice.changePercent && (
                      <div className="text-right">
                        <div className="text-lg font-medium">
                          {formatChange(latestPrice.changePercent)}
                        </div>
                        <div className="text-xs text-muted-foreground font-light">24h Change</div>
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground tracking-wide">Price Movement & AI Predictions</h3>
              
              {/* Minimal Time Period Controls */}
              <div className="flex items-center space-x-1 bg-muted/30 rounded-lg p-1 border border-border/40">
                {TIME_PERIODS.map(period => (
                  <Button
                    key={period.value}
                    variant={selectedPeriod === period.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedPeriod(period.value)}
                    className={`
                      h-8 px-3 text-xs font-medium transition-all duration-200 rounded-md
                      ${selectedPeriod === period.value 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground hover:bg-background/60"
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
              <div className="bg-card/50 border border-border/40 rounded-xl overflow-hidden backdrop-blur-sm">
                {/* Minimal Chart Header */}
                <div className="flex items-center justify-between px-6 py-3 bg-muted/10 border-b border-border/30">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-0.5 bg-foreground"></div>
                        <span className="text-sm font-medium">Actual Price</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-0.5 bg-[#10B981] opacity-80" style={{borderTop: '2px dashed #10B981'}}></div>
                        <span className="text-sm text-muted-foreground">Claude</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-0.5 bg-[#3B82F6] opacity-80" style={{borderTop: '2px dashed #3B82F6'}}></div>
                        <span className="text-sm text-muted-foreground">ChatGPT</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-0.5 bg-[#8B5CF6] opacity-80" style={{borderTop: '2px dashed #8B5CF6'}}></div>
                        <span className="text-sm text-muted-foreground">Deepseek</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="font-light">Yahoo Finance</span>
                    </div>
                    <span className="text-xs">•</span>
                    <span className="font-light">Real-time</span>
                  </div>
                </div>
                
                <div className="h-[500px] w-full bg-background/60 overflow-hidden">
                  <div className="h-full w-full relative">
                    {/* Subtle background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/80"></div>
                    
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={formattedData} margin={{ top: 10, right: 60, left: 10, bottom: 30 }}>
                        {/* Subtle professional grid */}
                        <CartesianGrid 
                          strokeDasharray="1 1" 
                          stroke="hsl(var(--border))" 
                          opacity={0.3}
                          horizontal={true}
                          vertical={false}
                        />
                        
                        {/* X-axis with professional styling */}
                        <XAxis 
                          dataKey="date" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ 
                            fill: "hsl(var(--muted-foreground))", 
                            fontSize: 11, 
                            fontWeight: 500 
                          }}
                          height={30}
                          interval="preserveStartEnd"
                        />
                        
                        {/* Y-axis positioned on right like TradingView */}
                        <YAxis 
                          orientation="right"
                          axisLine={false}
                          tickLine={false}
                          tick={{ 
                            fill: "hsl(var(--muted-foreground))", 
                            fontSize: 11, 
                            fontWeight: 500 
                          }}
                          tickFormatter={(value) => `$${Number(value).toFixed(2)}`}
                          domain={['dataMin - 2', 'dataMax + 2']}
                          width={60}
                        />
                        
                        <Tooltip content={<CustomTooltip />} />
                        
                        {/* Actual Price Line - bold and prominent */}
                        <Line
                          type="monotone"
                          dataKey="actualPrice"
                          stroke="#1f2937"
                          strokeWidth={2.5}
                          dot={false}
                          name="Actual Price"
                          connectNulls={true}
                        />
                        
                        {/* AI Model Prediction Lines - subtle and dashed */}
                        {aiModels?.map(model => (
                          <Line
                            key={model.id}
                            type="monotone"
                            dataKey={model.name}
                            stroke={aiModelColors[model.name as keyof typeof aiModelColors] || "#999999"}
                            strokeWidth={1.5}
                            strokeDasharray="4 4"
                            dot={false}
                            name={`${model.name} Prediction`}
                            connectNulls={true}
                            strokeOpacity={0.8}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Market Insights - Minimal Style */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card/30 border border-border/40 rounded-lg p-6 text-center backdrop-blur-sm">
              <div className="text-xs text-muted-foreground mb-2 font-light tracking-wide">30D VOLATILITY</div>
              <div className="text-xl font-medium text-orange-500">12.5%</div>
            </div>
            <div className="bg-card/30 border border-border/40 rounded-lg p-6 text-center backdrop-blur-sm">
              <div className="text-xs text-muted-foreground mb-2 font-light tracking-wide">AVG VOLUME</div>
              <div className="text-xl font-medium text-blue-500">2.8M</div>
            </div>
            <div className="bg-card/30 border border-border/40 rounded-lg p-6 text-center backdrop-blur-sm">
              <div className="text-xs text-muted-foreground mb-2 font-light tracking-wide">BEST MODEL</div>
              <div className="text-xl font-medium text-green-500">Deepseek</div>
            </div>
            <div className="bg-card/30 border border-border/40 rounded-lg p-6 text-center backdrop-blur-sm">
              <div className="text-xs text-muted-foreground mb-2 font-light tracking-wide">ACCURACY</div>
              <div className="text-xl font-medium text-primary">84.2%</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}