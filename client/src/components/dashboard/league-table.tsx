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
    <Card className="glass-card glass-shadow smooth-transition" data-testid="league-table">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-foreground">
            AI Model League Table
          </CardTitle>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-36 glass-card" data-testid="select-period">
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
        <div className="space-y-4">
          {leagueTable?.map((entry, index) => {
            const gradientClasses = [
              "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-700/50",
              "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-700/50",
              "bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200/50 dark:border-purple-700/50"
            ];

            const rankColors = [
              { bg: "bg-gradient-to-tr from-green-500 to-emerald-600", text: "text-green-600 dark:text-green-400" },
              { bg: "bg-gradient-to-tr from-blue-500 to-indigo-600", text: "text-blue-600 dark:text-blue-400" },
              { bg: "bg-gradient-to-tr from-purple-500 to-violet-600", text: "text-purple-600 dark:text-purple-400" }
            ];

            const colorScheme = rankColors[index] || rankColors[2];
            const cardClass = gradientClasses[index] || gradientClasses[2];

            return (
              <div 
                key={entry.aiModel.id} 
                className={`flex items-center justify-between p-4 rounded-xl border smooth-transition hover:scale-[1.02] ${cardClass}`}
                style={{ animationDelay: `${index * 0.1}s` }}
                data-testid={`league-entry-${entry.rank}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center justify-center w-8 h-8 ${colorScheme.bg} rounded-lg text-white font-bold text-sm`}>
                    {entry.rank}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground" data-testid={`model-name-${entry.rank}`}>
                      {entry.aiModel.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {entry.aiModel.provider}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${colorScheme.text}`} data-testid={`accuracy-${entry.rank}`}>
                    {entry.accuracy.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground" data-testid={`predictions-${entry.rank}`}>
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
