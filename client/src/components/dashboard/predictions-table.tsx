import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, ChevronUpIcon, DownloadIcon } from "lucide-react";
import { motion } from "framer-motion";
import type { Commodity, AiModel, Prediction } from "@shared/schema";

interface PredictionsTableProps {
  commodity: Commodity;
  aiModels: AiModel[];
}

interface PredictionRow {
  id: string;
  date: string;
  aiModel: string;
  timeframe: string;
  predictedPrice: string;
  confidence: string;
  currentPrice?: number;
  accuracy?: string;
  status: 'active' | 'expired';
}

export function PredictionsTable({ commodity, aiModels }: PredictionsTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch predictions data
  const { data: predictions, isLoading } = useQuery<PredictionRow[]>({
    queryKey: [`/api/commodities/${commodity.id}/predictions-table`],
    enabled: !!commodity.id,
  });

  // Simple display of recent predictions
  const displayData = predictions?.slice(0, 20) || []; // Show latest 20

  const handleExport = () => {
    const exportData = {
      commodity: commodity.name,
      symbol: commodity.symbol,
      data: displayData,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${commodity.symbol}_predictions.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted/30 rounded w-32"></div>
          <div className="h-3 bg-muted/20 rounded w-24"></div>
          <div className="space-y-2 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-3 bg-muted/20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <h3 className="font-medium text-foreground">Predictions Data</h3>
            {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {predictions?.length || 0} predictions available
          </p>
        </div>
        
        {isExpanded && displayData.length > 0 && (
          <Button
            variant="ghost" 
            size="sm"
            onClick={handleExport}
            className="text-xs"
          >
            <DownloadIcon className="h-3 w-3 mr-1" />
            Export
          </Button>
        )}
      </div>
      
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {displayData.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground text-sm">
              No predictions available
            </div>
          ) : (
            <div className="space-y-2">
              {displayData.map((row) => (
                <div 
                  key={row.id} 
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors text-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="font-mono text-muted-foreground text-xs">
                      {new Date(row.date).toLocaleDateString()}
                    </div>
                    <div className="font-medium">
                      {row.aiModel}
                    </div>
                    <div className="text-muted-foreground">
                      {row.timeframe}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="font-semibold">
                      ${parseFloat(row.predictedPrice).toFixed(2)}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {row.confidence}%
                    </div>
                  </div>
                </div>
              ))}
              
              {predictions && predictions.length > 20 && (
                <div className="text-center pt-3">
                  <p className="text-xs text-muted-foreground">
                    Showing latest 20 predictions • {predictions.length} total
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}