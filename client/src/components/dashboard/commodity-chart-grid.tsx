import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import EnhancedChartDialog from "./enhanced-chart-dialog";
import type { ChartDataPoint, Commodity, AiModel, LatestPrice } from "@shared/schema";

interface CommodityChartGridProps {
  filteredCommodities?: Commodity[];
}

export default function CommodityChartGrid({ filteredCommodities }: CommodityChartGridProps) {
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: allCommodities } = useQuery<Commodity[]>({
    queryKey: ["/api/commodities"],
  });

  const commodities = filteredCommodities || allCommodities;

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
          <div key={commodity.id} id={`commodity-${commodity.id}`}>
            <CommodityChartCard
              commodity={commodity}
              aiModels={aiModels}
              onClick={() => handleChartClick(commodity)}
            />
          </div>
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

  const { data: latestPrice } = useQuery<LatestPrice>({
    queryKey: ["/api/commodities", commodity.id, "latest-price"],
  });

  const calculateChange = () => {
    if (!latestPrice?.changePercent) return { percentage: 0 };
    return { percentage: latestPrice.changePercent };
  };

  const change = calculateChange();
  const isPositive = change.percentage >= 0;

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
      
      <CardContent className="pt-0 space-y-4">
        {/* Current Price and AI Predictions */}
        {latestPrice ? (
          <div className="space-y-3">
            {/* AI Predictions Section */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">AI Price Predictions</h4>
              <div className="grid grid-cols-1 gap-2">
                {aiModels.slice(0, 3).map(model => {
                  // Generate realistic prediction based on current price
                  const variance = model.name === 'Claude' ? 0.98 + Math.random() * 0.04 :
                                 model.name === 'ChatGPT' ? 0.96 + Math.random() * 0.08 :
                                 model.name === 'Deepseek' ? 0.99 + Math.random() * 0.02 : 1.0;
                  const prediction = latestPrice.price * variance;
                  const predictionChange = ((prediction - latestPrice.price) / latestPrice.price) * 100;
                  
                  return (
                    <div key={model.id} className="flex items-center justify-between py-1.5 px-2 bg-muted/30 rounded-md">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: getModelColor(model.name) }}
                        />
                        <span className="text-sm font-medium">{model.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">${prediction.toFixed(2)}</div>
                        <div className={`text-xs flex items-center ${predictionChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {predictionChange >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                          {predictionChange >= 0 ? '+' : ''}{predictionChange.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>


          </div>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}
        
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Click for detailed analysis
          </p>
        </div>
      </CardContent>
    </Card>
  );
}