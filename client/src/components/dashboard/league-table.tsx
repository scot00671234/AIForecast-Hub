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
          <div className="text-center py-16">
            <div className="text-muted-foreground mb-6">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-muted/30 to-muted/60 flex items-center justify-center">
                <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[14px] border-l-transparent border-r-transparent border-b-muted-foreground/60"></div>
              </div>
              <p className="text-xl font-semibold mb-2">No ranking data available</p>
              <p className="text-sm text-muted-foreground/80">Start making predictions to see model rankings</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
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

              const getGlowColor = (modelName: string) => {
                switch (modelName) {
                  case 'Claude': return 'hover:shadow-green-500/20';
                  case 'ChatGPT': return 'hover:shadow-blue-500/20';
                  case 'Deepseek': return 'hover:shadow-purple-500/20';
                  default: return 'hover:shadow-gray-500/20';
                }
              };

              return (
                <div 
                  key={entry.aiModel.id} 
                  className={`group relative flex items-center justify-between px-6 py-5 rounded-2xl bg-white/5 hover:bg-white/10 dark:bg-black/5 dark:hover:bg-black/10 border-0 hover:scale-[1.02] transition-all duration-300 hover:shadow-xl ${getGlowColor(entry.aiModel.name)} cursor-pointer backdrop-blur-sm`}
                  data-testid={`league-entry-${entry.rank}`}
                >
                  <div className="flex items-center space-x-6">
                    <div className="text-lg font-bold text-muted-foreground/60 group-hover:text-muted-foreground transition-colors min-w-[32px]">
                      #{entry.rank}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${getModelColor(entry.aiModel.name)} group-hover:scale-125 group-hover:shadow-lg transition-all duration-300`}></div>
                      <span className="text-lg font-semibold text-foreground group-hover:text-foreground transition-colors" data-testid={`model-name-${entry.rank}`}>
                        {entry.aiModel.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground group-hover:scale-105 transition-transform duration-300" 
                         data-testid={`accuracy-${entry.rank}`}>
                      {entry.accuracy.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground/80 font-medium">Accuracy</div>
                  </div>
                  
                  {/* Subtle gradient overlay on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}