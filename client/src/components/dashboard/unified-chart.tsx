import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, LineStyle } from 'lightweight-charts';
import { useTheme } from '@/components/theme-provider';
import { useQuery } from '@tanstack/react-query';

interface UnifiedChartProps {
  commodityId: string;
  period?: string;
  height?: number;
}

interface ChartDataPoint {
  time: number;
  value: number;
}

const UnifiedChart: React.FC<UnifiedChartProps> = ({ 
  commodityId, 
  period = "1mo", 
  height = 400 
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch chart data with predictions
  const { data: chartData, isLoading: dataLoading } = useQuery({
    queryKey: [`/api/commodities/${commodityId}/chart-with-predictions`, period],
    enabled: !!commodityId,
  });

  // Fetch AI models for colors
  const { data: aiModels } = useQuery({
    queryKey: ['/api/ai-models'],
  });

  useEffect(() => {
    // Clear loading state as soon as data loading is complete
    if (!dataLoading) {
      setIsLoading(false);
    }
    
    if (!chartContainerRef.current || dataLoading) return;
    
    if (!chartData) return;

    // Chart configuration
    const chartOptions = {
      layout: {
        background: { 
          type: ColorType.Solid, 
          color: theme === 'dark' ? '#0a0a0a' : '#ffffff' 
        },
        textColor: theme === 'dark' ? '#ffffff' : '#000000',
      },
      grid: {
        vertLines: { 
          color: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
          style: LineStyle.Dotted,
        },
        horzLines: { 
          color: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
          style: LineStyle.Dotted,
        },
      },
      crosshair: {
        mode: 1, // Normal crosshair
      },
      rightPriceScale: {
        borderColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
      },
      timeScale: {
        borderColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    };

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      ...chartOptions,
    });

    chartRef.current = chart;

    // Process and add data
    console.log('Chart data received:', chartData);
    if (chartData && chartData.chartData && Array.isArray(chartData.chartData) && chartData.chartData.length > 0) {
      // Separate historical and prediction data
      const historicalData: ChartDataPoint[] = [];
      const predictionData: { [modelName: string]: ChartDataPoint[] } = {};

      chartData.chartData.forEach((item: any) => {
        const timeStamp = new Date(item.date).getTime() / 1000; // Convert to Unix timestamp

        if (item.type === 'historical' && item.actualPrice !== null) {
          historicalData.push({
            time: timeStamp,
            value: item.actualPrice,
          });
        } else if (item.type === 'prediction' && item.predictions) {
          Object.entries(item.predictions).forEach(([modelName, price]) => {
            if (!predictionData[modelName]) {
              predictionData[modelName] = [];
            }
            predictionData[modelName].push({
              time: timeStamp,
              value: price as number,
            });
          });
        }
      });

      // Add historical data series (main line)
      if (historicalData.length > 0) {
        const historicalSeries = chart.addLineSeries({
          color: theme === 'dark' ? '#3b82f6' : '#1d4ed8',
          lineWidth: 2,
          title: 'Historical Price',
          priceLineVisible: false,
        });
        historicalSeries.setData(historicalData);
      }

      // Add prediction series for each AI model
      const modelColors = {
        'Claude': '#ef4444',
        'ChatGPT': '#22c55e', 
        'Deepseek': '#a855f7',
        'GPT-4': '#f59e0b',
      };

      Object.entries(predictionData).forEach(([modelName, data]) => {
        if (data.length > 0) {
          const color = modelColors[modelName as keyof typeof modelColors] || '#6b7280';
          const predictionSeries = chart.addLineSeries({
            color: color,
            lineWidth: 2,
            lineStyle: LineStyle.Dashed, // Dashed line for predictions
            title: `${modelName} Prediction`,
            priceLineVisible: false,
          });
          predictionSeries.setData(data);
        }
      });
    } else {
      console.log('No chart data available');
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [chartData, theme, height, dataLoading, commodityId]);

  // Update chart theme when theme changes
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.applyOptions({
        layout: {
          background: { 
            type: ColorType.Solid, 
            color: theme === 'dark' ? '#0a0a0a' : '#ffffff' 
          },
          textColor: theme === 'dark' ? '#ffffff' : '#000000',
        },
        grid: {
          vertLines: { 
            color: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
          },
          horzLines: { 
            color: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
          },
        },
        rightPriceScale: {
          borderColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
        },
        timeScale: {
          borderColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
        },
      });
    }
  }, [theme]);

  if (dataLoading || isLoading) {
    return (
      <div 
        className="flex items-center justify-center bg-background border border-border rounded-lg"
        style={{ height: `${height}px` }}
      >
        <div className="text-muted-foreground">Loading chart data...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-end">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-blue-500"></div>
            <span>Historical</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 border-t-2 border-dashed border-red-500"></div>
            <span>Claude</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 border-t-2 border-dashed border-green-500"></div>
            <span>ChatGPT</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 border-t-2 border-dashed border-purple-500"></div>
            <span>Deepseek</span>
          </div>
        </div>
      </div>
      <div 
        ref={chartContainerRef} 
        className="w-full border border-border rounded-lg bg-background"
        style={{ height: `${height}px` }}
      />
      <div className="mt-2 text-xs text-muted-foreground text-center">
        Use mouse wheel to zoom • Drag to pan • Click and drag on axes to scale
      </div>
    </div>
  );
};

export default UnifiedChart;

export { UnifiedChart };