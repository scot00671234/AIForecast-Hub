import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import EnhancedChartDialog from "./enhanced-chart-dialog";
import type { ChartDataPoint, Commodity, AiModel, LatestPrice } from "@shared/schema";

export default function CommodityChartGrid() {
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: commodities } = useQuery<Commodity[]>({
    queryKey: ["/api/commodities"],
  });

  const { data: aiModels } = useQuery<AiModel[]>({
    queryKey: ["/api/ai-models"],
  });

  const handleChartClick = (commodity: Commodity) => {
    setSelectedCommodity(commodity);
    setDialogOpen(true);
  };

  if (!commodities || !aiModels) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="glass-card">
            <CardHeader className="pb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {commodities.map(commodity => (
          <CommodityChartCard
            key={commodity.id}
            commodity={commodity}
            aiModels={aiModels}
            onClick={() => handleChartClick(commodity)}
          />
        ))}
      </div>

      {selectedCommodity && (
        <EnhancedChartDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          commodity={selectedCommodity}
          aiModels={aiModels}
        />
      )}
    </>
  );
}

interface CommodityChartCardProps {
  commodity: Commodity;
  aiModels: AiModel[];
  onClick: () => void;
}

function CommodityChartCard({ commodity, aiModels, onClick }: CommodityChartCardProps) {
  const { data: chartData, isLoading } = useQuery<ChartDataPoint[]>({
    queryKey: ["/api/commodities", commodity.id, "chart", 7],
  });

  const { data: latestPrice } = useQuery<LatestPrice>({
    queryKey: ["/api/commodities", commodity.id, "latest-price"],
  });

  const formattedData = chartData?.map(point => ({
    date: new Date(point.date).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric" 
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

  const calculateChange = () => {
    if (!formattedData || formattedData.length < 2) return { value: 0, percentage: 0 };
    const first = formattedData[0].actualPrice;
    const last = formattedData[formattedData.length - 1].actualPrice;
    const change = last - first;
    const percentage = (change / first) * 100;
    return { value: change, percentage };
  };

  const change = calculateChange();
  const isPositive = change.percentage >= 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const actualPrice = payload.find((p: any) => p.dataKey === 'actualPrice');
      
      return (
        <div className="bg-background/95 backdrop-blur border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-1">{label}</p>
          {actualPrice && (
            <p className="text-sm">
              <span className="text-muted-foreground">Actual: </span>
              <span className="font-semibold text-foreground">
                ${actualPrice.value?.toFixed(2)}
              </span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card 
      className="glass-card hover:shadow-lg cursor-pointer transition-all duration-200 hover:scale-[1.02]"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{commodity.name}</CardTitle>
            <p className="text-sm text-muted-foreground font-mono">{commodity.symbol}</p>
          </div>
          {latestPrice && (
            <div className="text-right">
              <p className="text-lg font-bold">{new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(latestPrice.price)}</p>
              <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {isPositive ? '+' : ''}{change.percentage.toFixed(2)}%
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  height={20}
                />
                <YAxis 
                  hide
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Actual Price Line with visible dots showing values */}
                <Line
                  type="monotone"
                  dataKey="actualPrice"
                  stroke="var(--foreground)"
                  strokeWidth={2}
                  dot={{ 
                    fill: 'var(--foreground)', 
                    strokeWidth: 2, 
                    r: 2,
                  }}
                  activeDot={{ 
                    r: 5, 
                    fill: 'var(--primary)',
                    stroke: 'var(--primary-foreground)',
                    strokeWidth: 2
                  }}
                />
                
                {/* AI Model Prediction Lines */}
                {aiModels.map(model => (
                  <Line
                    key={model.id}
                    type="monotone"
                    dataKey={model.name}
                    stroke={model.color}
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                    activeDot={{ r: 3, fill: model.color }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Click to view detailed analysis
          </p>
        </div>
      </CardContent>
    </Card>
  );
}