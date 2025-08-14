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
      <Card className="glass-card glass-shadow smooth-transition">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-9 w-32" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="text-right space-y-1">
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
    <Card className="glass-card hover-lift smooth-transition" data-testid="league-table">
      <CardHeader className="border-b border-border-subtle pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
            Model Rankings
          </CardTitle>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-36 btn-minimal" data-testid="select-period">
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
      
      <CardContent className="p-8">
        <div className="space-y-6">
          {leagueTable?.map((entry, index) => {
            const isFirst = index === 0;
            const isSecond = index === 1;
            const isThird = index === 2;

            return (
              <div 
                key={entry.aiModel.id} 
                className={`flex items-center justify-between p-6 rounded-xl border micro-transition hover-lift
                  ${isFirst ? 'elevated-surface border-primary/20' : 
                    isSecond ? 'elevated-surface border-border-prominent' : 
                    'premium-surface border-border-subtle'}`}
                style={{ animationDelay: `${index * 0.1}s` }}
                data-testid={`league-entry-${entry.rank}`}
              >
                <div className="flex items-center space-x-6">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm
                    ${isFirst ? 'bg-primary text-white' : 
                      isSecond ? 'bg-muted text-foreground' : 
                      'bg-muted text-muted-foreground'}`}>
                    {entry.rank}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg" data-testid={`model-name-${entry.rank}`}>
                      {entry.aiModel.name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium">
                      {entry.aiModel.provider}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-semibold tracking-tight
                    ${isFirst ? 'text-primary' : 'text-foreground'}`} 
                    data-testid={`accuracy-${entry.rank}`}>
                    {entry.accuracy.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground font-medium" data-testid={`predictions-${entry.rank}`}>
                    {entry.totalPredictions.toLocaleString()} predictions
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
