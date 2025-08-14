import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Commodity } from "@shared/schema";

interface PriceData {
  date: string;
  actualPrice: number | null;
  claudePrediction: number;
  chatgptPrediction: number;
  deepseekPrediction: number;
}

interface CommodityData {
  commodity: Commodity;
  currentPrice: number;
  priceChange: number;
  chartData: PriceData[];
}

export default function AllCommoditiesView() {
  const { data: commoditiesData, isLoading } = useQuery<CommodityData[]>({
    queryKey: ["/api/predictions/all"],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time feel
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
            All Commodities Overview
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Loading real-time commodity data and AI predictions...
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="glass-card animate-pulse">
              <CardHeader className="border-b border-border-subtle pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-6 bg-muted rounded w-32"></div>
                    <div className="h-4 bg-muted rounded w-24"></div>
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="h-8 bg-muted rounded w-20"></div>
                    <div className="h-4 bg-muted rounded w-16"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-64 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const aiModelColors = {
    "claudePrediction": "#10B981",
    "chatgptPrediction": "#3B82F6", 
    "deepseekPrediction": "#8B5CF6"
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
          All Commodities Overview
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Real-time prices with AI model predictions for all tracked commodities
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {commoditiesData?.map((data, index) => (
          <Card 
            key={data.commodity.id}
            className="glass-card hover-lift smooth-transition"
            style={{ animationDelay: `${index * 0.1}s` }}
            data-testid={`commodity-card-${data.commodity.symbol.toLowerCase()}`}
          >
            <CardHeader className="border-b border-border-subtle pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
                    {data.commodity.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground font-medium mt-1">
                    {data.commodity.symbol} • {data.commodity.category}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold text-foreground">
                    ${data.currentPrice.toFixed(2)}
                  </div>
                  <div className={`text-sm font-medium ${
                    data.priceChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {data.priceChange >= 0 ? '+' : ''}{data.priceChange}%
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => `$${value.toFixed(1)}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(8px)',
                      }}
                      labelStyle={{ color: 'var(--foreground)' }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: any, name: string) => [
                        `$${value?.toFixed(2) || 'N/A'}`, 
                        name === 'actualPrice' ? 'Actual Price' :
                        name === 'claudePrediction' ? 'Claude' :
                        name === 'chatgptPrediction' ? 'ChatGPT' :
                        name === 'deepseekPrediction' ? 'Deepseek' : name
                      ]}
                    />
                    
                    {/* Actual Price Line */}
                    <Line
                      type="monotone"
                      dataKey="actualPrice"
                      stroke="var(--foreground)"
                      strokeWidth={2}
                      dot={false}
                      name="Actual Price"
                      connectNulls={false}
                    />
                    
                    {/* AI Model Prediction Lines */}
                    {Object.entries(aiModelColors).map(([dataKey, color]) => (
                      <Line
                        key={dataKey}
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={false}
                        name={dataKey.replace('Prediction', '')}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Mini legend */}
              <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-foreground rounded-full"></div>
                  <span className="text-muted-foreground">Actual</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-muted-foreground">Claude</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-muted-foreground">ChatGPT</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-muted-foreground">Deepseek</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}