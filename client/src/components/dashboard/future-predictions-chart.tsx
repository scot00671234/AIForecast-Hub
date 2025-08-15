import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CalendarIcon, TrendingUpIcon, BrainIcon, RefreshCwIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Commodity, AiModel } from "@shared/schema";

interface FuturePrediction {
  date: string;
  actualPrice: number | null;
  predictions: Record<string, {
    value: number;
    confidence: number;
    modelName: string;
    color: string;
  }>;
}

interface FuturePredictionsData {
  commodity: Commodity;
  aiModels: AiModel[];
  futurePredictions: FuturePrediction[];
  totalPredictions: number;
}

interface FuturePredictionsChartProps {
  commodityId: string;
}

export function FuturePredictionsChart({ commodityId }: FuturePredictionsChartProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<FuturePredictionsData>({
    queryKey: ['/api/commodities', commodityId, 'future-predictions'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const generatePredictionsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/scheduler/run-commodity/${commodityId}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to generate predictions');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Predictions Generated",
        description: "New AI predictions have been generated for this commodity.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/commodities', commodityId, 'future-predictions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate predictions",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainIcon className="h-5 w-5" />
            Future AI Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainIcon className="h-5 w-5" />
            Future AI Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              {error ? "Failed to load predictions" : "No predictions available"}
            </p>
            <Button 
              onClick={() => generatePredictionsMutation.mutate()}
              disabled={generatePredictionsMutation.isPending}
              data-testid="button-generate-predictions"
            >
              {generatePredictionsMutation.isPending ? (
                <>
                  <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BrainIcon className="h-4 w-4 mr-2" />
                  Generate Predictions
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { commodity, aiModels, futurePredictions, totalPredictions } = data;

  // Format data for chart
  const chartData = futurePredictions.map(item => {
    const formatted: any = {
      date: new Date(item.date).toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric",
        year: "numeric"
      }),
      fullDate: item.date,
    };

    // Add each model's prediction
    Object.entries(item.predictions).forEach(([modelId, prediction]) => {
      formatted[prediction.modelName] = prediction.value;
      formatted[`${prediction.modelName}_confidence`] = prediction.confidence;
    });

    return formatted;
  });

  // Get the latest prediction values for summary
  const latestPredictions = futurePredictions.length > 0 ? futurePredictions[futurePredictions.length - 1] : null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => {
            const confidence = chartData.find(d => d.date === label)?.[`${entry.dataKey}_confidence`];
            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">{entry.dataKey}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">${entry.value?.toFixed(2)}</div>
                  {confidence && (
                    <div className="text-xs text-muted-foreground">
                      {confidence}% confidence
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BrainIcon className="h-5 w-5" />
              Future AI Predictions
            </CardTitle>
            <CardDescription>
              {commodity.name} • {totalPredictions} predictions • Updated monthly
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => generatePredictionsMutation.mutate()}
            disabled={generatePredictionsMutation.isPending}
            data-testid="button-refresh-predictions"
          >
            {generatePredictionsMutation.isPending ? (
              <RefreshCwIcon className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCwIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chart" data-testid="tab-chart">Chart View</TabsTrigger>
            <TabsTrigger value="summary" data-testid="tab-summary">Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="space-y-4">
            {chartData.length > 0 ? (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      fontSize={12}
                      tickFormatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    
                    {aiModels.map((model) => (
                      <Line
                        key={model.id}
                        type="monotone"
                        dataKey={model.name}
                        stroke={model.color}
                        strokeWidth={2}
                        dot={{ fill: model.color, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No future predictions available</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="summary" className="space-y-4">
            {latestPredictions ? (
              <div className="grid gap-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUpIcon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Latest Predictions</h3>
                  <Badge variant="outline">
                    {new Date(latestPredictions.date).toLocaleDateString()}
                  </Badge>
                </div>
                
                <div className="grid gap-3">
                  {Object.entries(latestPredictions.predictions).map(([modelId, prediction]) => {
                    const model = aiModels.find(m => m.id === modelId);
                    if (!model) return null;
                    
                    return (
                      <div 
                        key={modelId} 
                        className="flex items-center justify-between p-3 rounded-lg border"
                        data-testid={`prediction-${model.name.toLowerCase()}`}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: model.color }}
                          />
                          <div>
                            <div className="font-medium">{model.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {prediction.confidence}% confidence
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            ${prediction.value.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">
                    Prediction Range
                  </div>
                  <div className="text-lg font-semibold">
                    ${Math.min(...Object.values(latestPredictions.predictions).map(p => p.value)).toFixed(2)} - 
                    ${Math.max(...Object.values(latestPredictions.predictions).map(p => p.value)).toFixed(2)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BrainIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No prediction summary available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}