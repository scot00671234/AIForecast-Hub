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
  // AI Model color mapping
  const getModelColor = (modelName: string) => {
    const colors: Record<string, string> = {
      'Claude': '#10B981',
      'ChatGPT': '#3B82F6', 
      'Deepseek': '#8B5CF6',
      'Gemini': '#F59E0B'
    };
    return colors[modelName] || '#6B7280';
  };

  const { data: chartData, isLoading } = useQuery<ChartDataPoint[]>({
    queryKey: ["/api/commodities", commodity.id, "chart", 365], // 1 year of data
  });

  const { data: latestPrice } = useQuery<LatestPrice>({
    queryKey: ["/api/commodities", commodity.id, "latest-price"],
  });

  const formattedData = chartData?.map(point => ({
    date: new Date(point.date).toLocaleDateString("en-US", { 
      month: "short",
      year: "2-digit"
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
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-semibold truncate">{commodity.name}</CardTitle>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{commodity.symbol}</p>
          </div>
          {latestPrice && (
            <div className="text-right ml-3 flex-shrink-0">
              <p className="text-base font-bold leading-tight">{new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(latestPrice.price)}</p>
              <div className={`flex items-center justify-end text-xs mt-0.5 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {isPositive ? '+' : ''}{change.percentage.toFixed(2)}%
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                {/* Very subtle grid */}
                <CartesianGrid strokeDasharray="1 1" stroke="currentColor" className="opacity-5" />
                
                {/* Hide X-axis for cleaner mini view */}
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={false}
                  height={0}
                />
                <YAxis 
                  hide
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Main price trend line - clean and smooth */}
                <Line
                  type="monotone"
                  dataKey="actualPrice"
                  stroke={isPositive ? "#22c55e" : "#ef4444"}
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls={true}
                  activeDot={{ 
                    r: 3, 
                    fill: isPositive ? "#22c55e" : "#ef4444",
                    stroke: "white",
                    strokeWidth: 1
                  }}
                />
                
                {/* AI Model Prediction Lines - subtle for mini view */}
                {aiModels.map(model => (
                  <Line
                    key={model.id}
                    type="monotone"
                    dataKey={model.name}
                    stroke={getModelColor(model.name)}
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    dot={false}
                    connectNulls={true}
                    strokeOpacity={0.7}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            1 Year View • Click to view detailed analysis
          </p>
        </div>
      </CardContent>
    </Card>
  );
}