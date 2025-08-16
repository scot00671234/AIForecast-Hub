import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, LineSeries, Time } from 'lightweight-charts';
import { useTheme } from '@/components/theme-provider';

interface MockChartProps {
  commodityName: string;
  basePrice: number;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

export default function MockChart({ commodityName, basePrice, selectedPeriod, onPeriodChange }: MockChartProps) {
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

    // Get number of days based on selected period
    const getDaysForPeriod = (period: string) => {
      const periodMap: { [key: string]: number } = {
        '1d': 1, '5d': 5, '1w': 7, '1mo': 30, '3mo': 90,
        '6mo': 180, '1y': 365, '2y': 730, '5y': 1825
      };
      return periodMap[period] || 30;
    };

    // Deterministic seeded random for consistent data
    const seededRandom = (seed: number) => {
      let currentSeed = seed;
      return () => {
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        return currentSeed / 233280;
      };
    };

    // Create seed from commodity and period for consistency
    const createSeed = (commodityName: string, period: string) => {
      const str = `${commodityName}-${period}`;
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash);
    };

    // Generate mock data that stays completely consistent across all time periods
    const generateMockData = (startDate: Date, days: number, basePrice: number, volatility: number = 0.02) => {
      const data = [];
      const seed = createSeed(commodityName, 'base'); // Same seed regardless of period
      const rng = seededRandom(seed);
      
      // Always generate from a fixed reference point (5 years ago from today)
      const referenceDate = new Date();
      referenceDate.setFullYear(referenceDate.getFullYear() - 5);
      
      // Generate complete price history from reference date
      const maxDays = 1825; // 5 years
      const allPricesWithDates = [];
      let currentPrice = basePrice;
      
      for (let i = 0; i < maxDays; i++) {
        const date = new Date(referenceDate);
        date.setDate(date.getDate() + i);
        
        const change = (rng() - 0.5) * volatility * currentPrice;
        currentPrice += change;
        
        // Add some trend and cycles to make it look more realistic
        const trend = Math.sin(i / 10) * 0.001 * currentPrice;
        currentPrice += trend;
        
        allPricesWithDates.push({
          date: new Date(date),
          price: parseFloat(currentPrice.toFixed(2))
        });
      }
      
      // Now find the data that matches our requested time range
      const endDate = new Date();
      const actualStartDate = new Date(endDate);
      actualStartDate.setDate(actualStartDate.getDate() - days);
      
      for (let i = 0; i < days; i++) {
        const targetDate = new Date(actualStartDate);
        targetDate.setDate(targetDate.getDate() + i);
        
        // Find closest price in our generated data
        const closestPriceData = allPricesWithDates.reduce((closest, current) => {
          const currentDiff = Math.abs(current.date.getTime() - targetDate.getTime());
          const closestDiff = Math.abs(closest.date.getTime() - targetDate.getTime());
          return currentDiff < closestDiff ? current : closest;
        });
        
        data.push({
          time: Math.floor(targetDate.getTime() / 1000) as Time,
          value: closestPriceData.price
        });
      }
      
      return data;
    };

    // Generate prediction data that stays consistent across time periods
    const generatePredictionData = (actualData: any[], variance: number, modelName: string, startOffset: number = 60) => {
      const seed = createSeed(`${commodityName}-${modelName}`, 'predictions'); // Same seed regardless of period
      const rng = seededRandom(seed + 1000);
      
      // Generate consistent prediction offsets for this model
      const predictionOffsets: number[] = [];
      for (let i = 0; i < 2000; i++) { // Generate enough offsets for any time period
        predictionOffsets.push((rng() - 0.5) * variance * 0.3);
      }
      
      return actualData.slice(startOffset).map((point, index) => {
        // Use consistent offset based on index
        const randomVariance = predictionOffsets[index % predictionOffsets.length] * point.value;
        const trend = index * 0.0005 * point.value;
        const predictedValue = point.value + randomVariance + trend;
        
        // Keep predictions within ±10% of actual price
        const boundedValue = Math.max(
          Math.min(predictedValue, point.value * 1.1),
          point.value * 0.9
        );
        
        return {
          time: point.time as Time,
          value: parseFloat(boundedValue.toFixed(2))
        };
      });
    };

    const days = getDaysForPeriod(selectedPeriod);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Generate actual price data
    const actualData = generateMockData(startDate, days, basePrice, 0.03);
    
    // Generate AI prediction data with different characteristics
    // Start predictions from 2/3 through the data
    const predictionStart = Math.floor(days * 0.67);
    const claudeData = generatePredictionData(actualData, 0.02, 'claude', predictionStart);
    const chatgptData = generatePredictionData(actualData, 0.025, 'chatgpt', predictionStart);
    const deepseekData = generatePredictionData(actualData, 0.018, 'deepseek', predictionStart);

    // Add actual price series (bold black line)
    const actualSeries = chart.addSeries(LineSeries, {
      color: theme === 'dark' ? '#ffffff' : '#000000',
      lineWidth: 3,
      title: 'Actual Price',
    });
    actualSeries.setData(actualData);

    // Add Claude predictions (green dotted line) - no visible markers by default
    const claudeSeries = chart.addSeries(LineSeries, {
      color: '#22c55e',
      lineWidth: 2,
      lineStyle: 2,
      title: 'Claude Prediction',
      priceLineVisible: false,  // Hide price line labels
      lastValueVisible: false,  // Hide last value labels
    });
    claudeSeries.setData(claudeData);

    // Add ChatGPT predictions (blue dotted line) - no visible markers by default
    const chatgptSeries = chart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      lineStyle: 2,
      title: 'ChatGPT Prediction',
      priceLineVisible: false,  // Hide price line labels
      lastValueVisible: false,  // Hide last value labels
    });
    chatgptSeries.setData(chatgptData);

    // Add Deepseek predictions (purple dotted line) - no visible markers by default
    const deepseekSeries = chart.addSeries(LineSeries, {
      color: '#8b5cf6',
      lineWidth: 2,
      lineStyle: 2,
      title: 'Deepseek Prediction',
      priceLineVisible: false,  // Hide price line labels
      lastValueVisible: false,  // Hide last value labels
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
  }, [theme, commodityName, basePrice, selectedPeriod]);

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
          {[
            { value: '1d', label: '1D' },
            { value: '5d', label: '5D' },
            { value: '1w', label: '1W' },
            { value: '1mo', label: '1M' },
            { value: '3mo', label: '3M' },
            { value: '6mo', label: '6M' },
            { value: '1y', label: '1Y' },
            { value: '2y', label: '2Y' },
            { value: '5y', label: '5Y' }
          ].map((period) => (
            <button
              key={period.value}
              onClick={() => onPeriodChange(period.value)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                selectedPeriod === period.value
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg relative">
        <div ref={chartContainerRef} className="w-full h-96" />
        
        {/* Data attribution footer */}
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 text-right bg-gray-50 dark:bg-gray-800/50">
          Data from Yahoo Finance • Updated {new Date().toLocaleTimeString('en-US', { hour12: false })}
        </div>
      </div>
    </div>
  );
}