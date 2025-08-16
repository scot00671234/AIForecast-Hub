import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { LeagueTableEntry } from "@shared/schema";
import { TIME_PERIODS } from "@/lib/constants";

export default function LeagueTable() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  const { data: leagueTable, isLoading } = useQuery<LeagueTableEntry[]>({
    queryKey: ["/api/league-table", selectedPeriod],
  });

  if (isLoading) {
    return (
      <Card className="bg-transparent border-0 shadow-none">
        <CardHeader className="border-0 pb-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-6 py-5 rounded-2xl bg-white/5 dark:bg-black/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <Skeleton className="w-8 h-6" />
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-4 h-4 rounded-full" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Skeleton className="h-7 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent border-0 shadow-none" data-testid="league-table">
      <CardHeader className="border-0 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-foreground">
            Model Rankings
          </CardTitle>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40 bg-transparent border border-border/30 hover:border-border/60 rounded-lg transition-colors" data-testid="select-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIME_PERIODS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 pt-2">
        {!leagueTable || leagueTable.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-muted-foreground/60"></div>
              </div>
              <p className="text-lg font-medium mb-2">No ranking data available</p>
              <p className="text-sm text-muted-foreground/80">Start making predictions to see model rankings</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {leagueTable.map((entry, index) => {
              // Get model color indicator
              const getModelColor = (modelName: string) => {
                switch (modelName) {
                  case 'Claude': return 'bg-green-500';
                  case 'ChatGPT': return 'bg-blue-500';
                  case 'Deepseek': return 'bg-purple-500';
                  default: return 'bg-gray-500';
                }
              };

              return (
                <div 
                  key={entry.aiModel.id} 
                  className="group flex items-center justify-between py-4 px-5 rounded-lg border border-border/50 bg-card/30 hover:bg-card/50 transition-all duration-200 hover:border-border/80"
                  data-testid={`league-entry-${entry.rank}`}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-muted-foreground min-w-[24px]">
                      #{entry.rank}
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${getModelColor(entry.aiModel.name)}`}></div>
                      <span className="font-medium text-foreground" data-testid={`model-name-${entry.rank}`}>
                        {entry.aiModel.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold text-foreground" 
                         data-testid={`accuracy-${entry.rank}`}>
                      {entry.accuracy.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}