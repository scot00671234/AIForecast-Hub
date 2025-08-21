import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronDownIcon, ChevronUpIcon, DownloadIcon, FilterIcon, SearchIcon } from "lucide-react";
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
  const [sortField, setSortField] = useState<keyof PredictionRow>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterModel, setFilterModel] = useState<string>('all');
  const [filterTimeframe, setFilterTimeframe] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch predictions data
  const { data: predictions, isLoading } = useQuery<PredictionRow[]>({
    queryKey: [`/api/commodities/${commodity.id}/predictions-table`],
    enabled: !!commodity.id,
  });

  // Get model colors
  const getModelColor = (modelName: string) => {
    const colors: Record<string, string> = {
      'Claude': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'ChatGPT': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', 
      'Deepseek': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    return colors[modelName] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getAccuracyColor = (accuracy: string) => {
    if (!accuracy || accuracy === 'TBD') return 'text-muted-foreground';
    const value = parseFloat(accuracy);
    if (value >= 85) return 'text-green-600 dark:text-green-400';
    if (value >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Filter and sort data
  const filteredData = predictions?.filter(row => {
    const matchesModel = filterModel === 'all' || row.aiModel === filterModel;
    const matchesTimeframe = filterTimeframe === 'all' || row.timeframe === filterTimeframe;
    const matchesSearch = searchTerm === '' || 
      Object.values(row).some(value => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesModel && matchesTimeframe && matchesSearch;
  }) || [];

  const sortedData = [...filteredData].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    
    if (sortField === 'date') {
      const comparison = new Date(aVal as string).getTime() - new Date(bVal as string).getTime();
      return sortDirection === 'asc' ? comparison : -comparison;
    }
    
    if (sortField === 'predictedPrice') {
      const comparison = parseFloat(aVal as string) - parseFloat(bVal as string);
      return sortDirection === 'asc' ? comparison : -comparison;
    }
    
    const comparison = (aVal as string).localeCompare(bVal as string);
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: keyof PredictionRow) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExport = (format: 'json' | 'pdf' | 'csv') => {
    const exportData = {
      commodity: commodity.name,
      symbol: commodity.symbol,
      data: sortedData,
      filters: {
        model: filterModel,
        timeframe: filterTimeframe,
        search: searchTerm
      },
      exportedAt: new Date().toISOString()
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${commodity.symbol}_predictions.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const headers = ['Date', 'AI Model', 'Timeframe', 'Predicted Price', 'Confidence', 'Current Price', 'Accuracy', 'Status'];
      const csvData = [
        headers.join(','),
        ...sortedData.map(row => [
          row.date,
          row.aiModel,
          row.timeframe,
          row.predictedPrice,
          row.confidence,
          row.currentPrice || '',
          row.accuracy || '',
          row.status
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${commodity.symbol}_predictions.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    // PDF export would require additional library like jsPDF
  };

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-current"></div>
            Predictions Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle 
              className="text-lg flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-current"></div>
              Predictions Data
              {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            </CardTitle>
            <CardDescription>
              {filteredData.length} predictions • Click to expand table view
            </CardDescription>
          </div>
          
          {isExpanded && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('csv')}
                className="flex items-center gap-1"
              >
                <DownloadIcon className="h-3 w-3" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('json')}
                className="flex items-center gap-1"
              >
                <DownloadIcon className="h-3 w-3" />
                JSON
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-2">
                <FilterIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              
              <Select value={filterModel} onValueChange={setFilterModel}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="AI Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  <SelectItem value="Claude">Claude</SelectItem>
                  <SelectItem value="ChatGPT">ChatGPT</SelectItem>
                  <SelectItem value="Deepseek">Deepseek</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterTimeframe} onValueChange={setFilterTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Times</SelectItem>
                  <SelectItem value="3mo">3 Months</SelectItem>
                  <SelectItem value="6mo">6 Months</SelectItem>
                  <SelectItem value="9mo">9 Months</SelectItem>
                  <SelectItem value="12mo">12 Months</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative flex-1 max-w-sm">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search predictions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/40">
                    <tr>
                      {[
                        { key: 'date', label: 'Date' },
                        { key: 'aiModel', label: 'AI Model' },
                        { key: 'timeframe', label: 'Timeframe' },
                        { key: 'predictedPrice', label: 'Predicted Price' },
                        { key: 'confidence', label: 'Confidence' },
                        { key: 'currentPrice', label: 'Current Price' },
                        { key: 'accuracy', label: 'Accuracy' },
                        { key: 'status', label: 'Status' }
                      ].map(header => (
                        <th
                          key={header.key}
                          className="text-left p-3 font-medium cursor-pointer hover:bg-muted/60 transition-colors"
                          onClick={() => handleSort(header.key as keyof PredictionRow)}
                        >
                          <div className="flex items-center gap-1">
                            {header.label}
                            {sortField === header.key && (
                              sortDirection === 'asc' ? 
                                <ChevronUpIcon className="h-3 w-3" /> : 
                                <ChevronDownIcon className="h-3 w-3" />
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sortedData.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center p-8 text-muted-foreground">
                          No predictions found matching your filters
                        </td>
                      </tr>
                    ) : (
                      sortedData.map((row, index) => (
                        <motion.tr 
                          key={row.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.02 }}
                          className="hover:bg-muted/20 transition-colors"
                        >
                          <td className="p-3 font-mono text-sm">
                            {new Date(row.date).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <Badge variant="secondary" className={getModelColor(row.aiModel)}>
                              {row.aiModel}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">{row.timeframe}</Badge>
                          </td>
                          <td className="p-3 font-semibold">
                            ${parseFloat(row.predictedPrice).toFixed(2)}
                          </td>
                          <td className="p-3">{row.confidence}%</td>
                          <td className="p-3 font-mono">
                            {row.currentPrice ? `$${row.currentPrice.toFixed(2)}` : '-'}
                          </td>
                          <td className={`p-3 font-medium ${getAccuracyColor(row.accuracy || '')}`}>
                            {row.accuracy || 'TBD'}
                          </td>
                          <td className="p-3">
                            <Badge variant="secondary" className={getStatusColor(row.status)}>
                              {row.status}
                            </Badge>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {sortedData.length > 0 && (
              <div className="text-xs text-muted-foreground text-center pt-2">
                Showing {sortedData.length} of {predictions?.length || 0} predictions
              </div>
            )}
          </CardContent>
        </motion.div>
      )}
    </Card>
  );
}