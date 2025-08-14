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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-card glass-shadow smooth-transition">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
              <div className="mt-4">
                <Skeleton className="h-4 w-32" />
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
      icon: BrainIcon,
      trend: "+12%",
      trendLabel: "vs last month",
      iconBg: "bg-blue-100 dark:bg-blue-900/50",
      iconColor: "text-blue-600 dark:text-blue-400",
      testId: "stat-total-predictions",
    },
    {
      title: "Top Performer",
      value: stats.topModel,
      icon: TrophyIcon,
      subtitle: `Accuracy: ${stats.topAccuracy.toFixed(1)}%`,
      iconBg: "bg-green-100 dark:bg-green-900/50",
      iconColor: "text-green-600 dark:text-green-400",
      testId: "stat-top-performer",
    },
    {
      title: "Active Commodities",
      value: stats.activeCommodities.toString(),
      icon: CoinsIcon,
      subtitle: "Hard: 8 • Soft: 6",
      iconBg: "bg-amber-100 dark:bg-amber-900/50",
      iconColor: "text-amber-600 dark:text-amber-400",
      testId: "stat-active-commodities",
    },
    {
      title: "Avg Accuracy",
      value: `${stats.avgAccuracy.toFixed(1)}%`,
      icon: PercentIcon,
      trend: "+3.2%",
      trendLabel: "this week",
      iconBg: "bg-purple-100 dark:bg-purple-900/50",
      iconColor: "text-purple-600 dark:text-purple-400",
      testId: "stat-avg-accuracy",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.title} 
            className="glass-card glass-shadow smooth-transition hover:scale-105"
            style={{ animationDelay: `${index * 0.1}s` }}
            data-testid={stat.testId}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground" data-testid={`${stat.testId}-value`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 ${stat.iconBg} rounded-xl`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {stat.trend && (
                  <>
                    <span className="text-green-600 dark:text-green-400 flex items-center">
                      <TrendingUpIcon className="h-3 w-3 mr-1" />
                      {stat.trend}
                    </span>
                    <span className="text-muted-foreground ml-2">{stat.trendLabel}</span>
                  </>
                )}
                {stat.subtitle && (
                  <span className="text-muted-foreground">{stat.subtitle}</span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
