import { useQuery } from "@tanstack/react-query";
import { BrainIcon, TrophyIcon, CoinsIcon, PercentIcon, TrendingUpIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@shared/schema";

export default function StatsOverview() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-card hover-lift smooth-transition">
            <CardContent className="p-8">
              <div className="space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: "Total Predictions",
      value: stats.totalPredictions.toLocaleString(),
      trend: "+12%",
      trendLabel: "vs last month",
      testId: "stat-total-predictions",
    },
    {
      title: "Top Performer",
      value: stats.topModel,
      subtitle: `${stats.topAccuracy.toFixed(1)}% accuracy`,
      testId: "stat-top-performer",
    },
    {
      title: "Active Commodities",
      value: stats.activeCommodities.toString(),
      subtitle: "14 markets tracked",
      testId: "stat-active-commodities",
    },
    {
      title: "Average Accuracy",
      value: `${stats.avgAccuracy.toFixed(1)}%`,
      trend: "+3.2%",
      trendLabel: "this week",
      testId: "stat-avg-accuracy",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in">
      {statCards.map((stat, index) => (
        <Card 
          key={stat.title} 
          className="glass-card hover-lift smooth-transition"
          style={{ animationDelay: `${index * 0.1}s` }}
          data-testid={stat.testId}
        >
          <CardContent className="p-8">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                {stat.title}
              </p>
              <p className="text-3xl font-semibold text-foreground tracking-tight" data-testid={`${stat.testId}-value`}>
                {stat.value}
              </p>
              <div className="flex items-center text-sm">
                {stat.trend && (
                  <div className="flex items-center text-primary">
                    <TrendingUpIcon className="h-3 w-3 mr-1" />
                    <span className="font-medium">{stat.trend}</span>
                    <span className="text-muted-foreground ml-2">{stat.trendLabel}</span>
                  </div>
                )}
                {stat.subtitle && (
                  <span className="text-muted-foreground">{stat.subtitle}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
