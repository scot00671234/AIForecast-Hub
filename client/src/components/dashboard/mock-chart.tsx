import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, LineSeries, Time } from 'lightweight-charts';
import { useTheme } from '@/components/theme-provider';

interface MockChartProps {
  commodityName: string;
  basePrice: number;
}

export default function MockChart({ commodityName, basePrice }: MockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { 
          type: ColorType.Solid, 
          color: theme === 'dark' ? '#1a1a1a' : '#ffffff' 
        },
        textColor: theme === 'dark' ? '#ffffff' : '#000000',
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      grid: {
        vertLines: {
          color: theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
        },
        horzLines: {
          color: theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
        },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: theme === 'dark' ? '#485158' : '#cccccc',
      },
      timeScale: {
        borderColor: theme === 'dark' ? '#485158' : '#cccccc',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Generate mock data that looks realistic for the specific commodity
    const generateMockData = (startDate: Date, days: number, basePrice: number, volatility: number = 0.02) => {
      const data = [];
      let currentPrice = basePrice;
      
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Add realistic price movement
        const change = (Math.random() - 0.5) * volatility * currentPrice;
        currentPrice += change;
        
        // Add some trend and cycles to make it look more realistic
        const trend = Math.sin(i / 10) * 0.001 * currentPrice;
        currentPrice += trend;
        
        data.push({
          time: Math.floor(date.getTime() / 1000) as Time,
          value: parseFloat(currentPrice.toFixed(2))
        });
      }
      return data;
    };

    // Generate prediction data that diverges from actual
    const generatePredictionData = (actualData: any[], variance: number, startOffset: number = 60) => {
      return actualData.slice(startOffset).map((point, index) => {
        const randomVariance = (Math.random() - 0.5) * variance * point.value;
        const trend = index * 0.001 * point.value; // Add slight trend
        return {
          time: point.time as Time,
          value: parseFloat((point.value + randomVariance + trend).toFixed(2))
        };
      });
    };

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90); // 90 days ago
    
    // Generate actual price data
    const actualData = generateMockData(startDate, 90, basePrice, 0.03);
    
    // Generate AI prediction data with different characteristics
    const claudeData = generatePredictionData(actualData, 0.04, 60);
    const chatgptData = generatePredictionData(actualData, 0.05, 60);
    const deepseekData = generatePredictionData(actualData, 0.03, 60);

    // Add actual price series (bold black line)
    const actualSeries = chart.addSeries(LineSeries, {
      color: theme === 'dark' ? '#ffffff' : '#000000',
      lineWidth: 3,
      title: 'Actual Price',
    });
    actualSeries.setData(actualData);

    // Add Claude predictions (green dotted line)
    const claudeSeries = chart.addSeries(LineSeries, {
      color: '#22c55e',
      lineWidth: 2,
      lineStyle: 2,
      title: 'Claude Prediction',
    });
    claudeSeries.setData(claudeData);

    // Add ChatGPT predictions (blue dotted line)
    const chatgptSeries = chart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      lineStyle: 2,
      title: 'ChatGPT Prediction',
    });
    chatgptSeries.setData(chatgptData);

    // Add Deepseek predictions (purple dotted line)
    const deepseekSeries = chart.addSeries(LineSeries, {
      color: '#8b5cf6',
      lineWidth: 2,
      lineStyle: 2,
      title: 'Deepseek Prediction',
    });
    deepseekSeries.setData(deepseekData);

    // Fit content to show all data
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [theme, commodityName, basePrice]);

  return (
    <div className="space-y-4">
      {/* Header matching your reference image */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Price Movement & AI Predictions
          </h3>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-black dark:bg-white"></div>
              <span className="text-gray-900 dark:text-white">Actual Price</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 border-t-2 border-dotted border-green-500"></div>
              <span className="text-gray-500">Claude</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 border-t-2 border-dotted border-blue-500"></div>
              <span className="text-gray-500">ChatGPT</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 border-t-2 border-dotted border-purple-500"></div>
              <span className="text-gray-500">Deepseek</span>
            </div>
          </div>
        </div>
        
        {/* Time period buttons */}
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 p-1">
          {['1D', '5D', '1W', '1M', '3M', '6M', '1Y', '2Y', '5Y'].map((period) => (
            <button
              key={period}
              className={`px-3 py-1 text-xs font-medium rounded ${
                period === '6M'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div ref={chartContainerRef} className="w-full h-96" />
        
        {/* Data attribution footer */}
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 text-right">
          Data from Yahoo Finance • Updated 22:16:40
        </div>
      </div>
    </div>
  );
}