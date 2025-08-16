import type { Commodity } from "@shared/schema";
import CommodityChartGrid from "./commodity-chart-grid";

interface AllCommoditiesViewProps {
  filteredCommodities?: Commodity[];
}

export default function AllCommoditiesView({ filteredCommodities }: AllCommoditiesViewProps) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
          {filteredCommodities ? 'Search Results' : 'All Commodities Overview'}
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Click any chart to view detailed analysis with multiple time periods and Yahoo Finance data
        </p>
      </div>

      <CommodityChartGrid filteredCommodities={filteredCommodities} />
    </div>
  );
}