import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { ChartDataPoint, Commodity, AiModel } from "@shared/schema";

export default function PriceChart() {
  const [selectedDays, setSelectedDays] = useState(7);
  const [selectedCommodityId, setSelectedCommodityId] = useState<string | null>(null);

  const { data: commodities } = useQuery<Commodity[]>({
    queryKey: ["/api/commodities"],
  });

  const { data: aiModels } = useQuery<AiModel[]>({
    queryKey: ["/api/ai-models"],
  });

  // Use first commodity as default
  const defaultCommodityId = commodities?.[0]?.id;
  const activeCommodityId = selectedCommodityId || defaultCommodityId;

  const { data: chartData, isLoading } = useQuery<ChartDataPoint[]>({
    queryKey: ["/api/commodities", activeCommodityId, "chart", selectedDays],
    enabled: !!activeCommodityId,
  });

  const { data: latestPrice } = useQuery({
    queryKey: ["/api/commodities", activeCommodityId, "latest-price"],
    enabled: !!activeCommodityId,
  });

  const selectedCommodity = commodities?.find(c => c.id === activeCommodityId);

  const formattedData = useMemo(() => {
    if (!chartData || !aiModels) return [];

    return chartData.map(point => {
      const formattedPoint: any = {
        date: new Date(point.date).toLocaleDateString(),
        actualPrice: point.actualPrice,
      };

      // Add prediction data for each AI model
      aiModels.forEach(model => {
        if (point.predictions[model.id]) {
          formattedPoint[model.name] = point.predictions[model.id];
        }
      });

      return formattedPoint;
    });
  }, [chartData, aiModels]);

  const aiModelColors = {
    "Claude": "#10B981",
    "ChatGPT": "#3B82F6", 
    "Deepseek": "#8B5CF6"
  };

  if (isLoading) {
    return (
      <Card className="glass-card glass-shadow smooth-transition">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-64 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex space-x-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-12" />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card glass-shadow smooth-transition" data-testid="price-chart">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-foreground">
              {selectedCommodity?.name || "Commodity"} ({selectedCommodity?.symbol}) - Predictions vs Actual
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Current Price: <span className="font-semibold text-green-600 dark:text-green-400" data-testid="current-price">
                ${latestPrice?.price || "N/A"}
              </span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {[7, 30, 90].map(days => (
              <Button
                key={days}
                variant={selectedDays === days ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDays(days)}
                className={`${selectedDays === days ? "" : "glass-card"} smooth-transition`}
                data-testid={`button-days-${days}`}
              >
                {days}D
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(8px)',
                }}
                labelStyle={{ color: 'var(--foreground)' }}
              />
              <Legend />
              
              {/* Actual Price Line */}
              <Line
                type="monotone"
                dataKey="actualPrice"
                stroke="var(--foreground)"
                strokeWidth={3}
                dot={{ fill: 'var(--foreground)', strokeWidth: 2, r: 4 }}
                name="Actual Price"
              />
              
              {/* AI Model Prediction Lines */}
              {aiModels?.map(model => (
                <Line
                  key={model.id}
                  type="monotone"
                  dataKey={model.name}
                  stroke={model.color}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: model.color, strokeWidth: 2, r: 3 }}
                  name={model.name}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Chart Legend */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center" data-testid="chart-legend">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-foreground rounded-full"></div>
            <span className="text-sm text-muted-foreground">Actual Price</span>
          </div>
          {aiModels?.map(model => (
            <div key={model.id} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: model.color }}
              ></div>
              <span className="text-sm text-muted-foreground">{model.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
