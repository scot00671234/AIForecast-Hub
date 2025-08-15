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
      <Card className="bg-card/30 border border-border/40 rounded-xl backdrop-blur-sm">
        <CardHeader className="border-b border-border/30 pb-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-9 w-32" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-5 rounded-lg border border-border/40">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/30 border border-border/40 rounded-xl backdrop-blur-sm" data-testid="league-table">
      <CardHeader className="border-b border-border/30 pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium tracking-wide text-foreground">
            Model Rankings
          </CardTitle>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-36 bg-muted/30 border border-border/40 rounded-lg" data-testid="select-period">
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
      
      <CardContent className="p-6">
        {!leagueTable || leagueTable.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-muted-foreground/60"></div>
              </div>
              <p className="text-lg font-medium">No ranking data available</p>
              <p className="text-sm">Start making predictions to see model rankings</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {leagueTable.map((entry, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;
              
              // Medal icons for top 3
              const getMedalIcon = () => {
                if (isFirst) return "🥇";
                if (isSecond) return "🥈";
                if (isThird) return "🥉";
                return null;
              };

              return (
                <div 
                  key={entry.aiModel.id} 
                  className={`flex items-center justify-between p-5 rounded-lg border transition-all duration-200 hover:shadow-md
                    ${isFirst ? 'bg-primary/5 border-primary/20 shadow-sm' : 
                      isSecond ? 'bg-muted/30 border-border/60' : 
                      'bg-card/20 border-border/40 hover:bg-card/40'}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  data-testid={`league-entry-${entry.rank}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      {getMedalIcon() ? (
                        <div className="text-2xl">{getMedalIcon()}</div>
                      ) : (
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/60 text-muted-foreground text-sm font-medium">
                          {entry.rank}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground text-base" data-testid={`model-name-${entry.rank}`}>
                        {entry.aiModel.name}
                      </h3>
                      <p className="text-sm text-muted-foreground font-light">
                        {entry.aiModel.provider}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className={`text-xl font-medium tracking-tight
                      ${isFirst ? 'text-primary' : 'text-foreground'}`} 
                      data-testid={`accuracy-${entry.rank}`}>
                      {entry.accuracy.toFixed(1)}%
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span data-testid={`predictions-${entry.rank}`}>
                        {entry.totalPredictions.toLocaleString()} predictions
                      </span>
                      {entry.trend !== undefined && (
                        <span className={`text-xs ${entry.trend > 0 ? 'text-green-500' : entry.trend < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                          {entry.trend > 0 ? '↗' : entry.trend < 0 ? '↘' : '→'}
                        </span>
                      )}
                    </div>
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
