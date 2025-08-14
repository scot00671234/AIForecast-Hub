import { useQuery } from "@tanstack/react-query";
import { HammerIcon, Sprout } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Commodity } from "@shared/schema";
import { COMMODITY_CATEGORIES } from "@/lib/constants";

interface CommoditySelectorProps {
  onSelect?: (commodity: Commodity) => void;
  selectedCommodityId?: string;
}

export default function CommoditySelector({ onSelect, selectedCommodityId }: CommoditySelectorProps) {
  const { data: commodities, isLoading } = useQuery<Commodity[]>({
    queryKey: ["/api/commodities"],
  });

  if (isLoading) {
    return (
      <Card className="glass-card glass-shadow smooth-transition">
        <CardHeader className="border-b border-border/50">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {Array.from({ length: 2 }).map((_, categoryIndex) => (
            <div key={categoryIndex}>
              <div className="flex items-center mb-3">
                <Skeleton className="h-4 w-4 mr-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const hardCommodities = commodities?.filter(c => c.category === COMMODITY_CATEGORIES.HARD) || [];
  const softCommodities = commodities?.filter(c => c.category === COMMODITY_CATEGORIES.SOFT) || [];

  const handleCommoditySelect = (commodity: Commodity) => {
    onSelect?.(commodity);
  };

  return (
    <Card className="glass-card glass-shadow smooth-transition" data-testid="commodity-selector">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="text-xl font-semibold text-foreground">
          Commodity Categories
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4 custom-scrollbar max-h-96 overflow-y-auto">
        {/* Hard Commodities */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center">
            <HammerIcon className="w-4 h-4 mr-2" />
            Hard Commodities
          </h3>
          <div className="space-y-2">
            {hardCommodities.map((commodity) => (
              <Button
                key={commodity.id}
                variant="ghost"
                className={`w-full justify-between h-auto p-3 glass-card smooth-transition hover:scale-[1.02] ${
                  selectedCommodityId === commodity.id 
                    ? "ring-2 ring-primary bg-primary/10" 
                    : ""
                }`}
                onClick={() => handleCommoditySelect(commodity)}
                data-testid={`commodity-${commodity.symbol.toLowerCase()}`}
              >
                <span className="text-sm text-foreground font-medium">
                  {commodity.name}
                </span>
                <span className="text-xs text-muted-foreground group-hover:text-primary">
                  {commodity.symbol}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Soft Commodities */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center">
            <Sprout className="w-4 h-4 mr-2" />
            Soft Commodities
          </h3>
          <div className="space-y-2">
            {softCommodities.map((commodity) => (
              <Button
                key={commodity.id}
                variant="ghost"
                className={`w-full justify-between h-auto p-3 glass-card smooth-transition hover:scale-[1.02] ${
                  selectedCommodityId === commodity.id 
                    ? "ring-2 ring-primary bg-primary/10" 
                    : ""
                }`}
                onClick={() => handleCommoditySelect(commodity)}
                data-testid={`commodity-${commodity.symbol.toLowerCase()}`}
              >
                <span className="text-sm text-foreground font-medium">
                  {commodity.name}
                </span>
                <span className="text-xs text-muted-foreground group-hover:text-primary">
                  {commodity.symbol}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
