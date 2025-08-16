import { storage } from "../storage";
import type { InsertActualPrice } from "@shared/schema";

interface YahooFinanceResponse {
  chart: {
    result: Array<{
      meta: {
        symbol: string;
        regularMarketPrice: number;
        regularMarketChange?: number;
        regularMarketChangePercent?: number;
        currency: string;
      };
      timestamp: number[];
      indicators: {
        quote: Array<{
          close: number[];
          volume: number[];
        }>;
      };
    }>;
  };
}

class YahooFinanceService {
  private rateLimitDelay = 1000; // 1 second between requests
  private lastRequestTime = 0;

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await this.delay(this.rateLimitDelay - timeSinceLastRequest);
    }
    
    this.lastRequestTime = Date.now();
  }

  async fetchHistoricalData(yahooSymbol: string, period = "7d", interval = "1d"): Promise<YahooFinanceResponse | null> {
    await this.enforceRateLimit();

    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=${period}&interval=${interval}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        console.error(`Yahoo Finance API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json() as YahooFinanceResponse;
      return data;
    } catch (error) {
      console.error(`Error fetching data for ${yahooSymbol}:`, error);
      return null;
    }
  }

  async updateCommodityPrices(commodityId?: string): Promise<void> {
    try {
      const commodities = commodityId 
        ? [await storage.getCommodity(commodityId)].filter(Boolean)
        : await storage.getCommodities();

      for (const commodity of commodities) {
        if (!commodity?.yahooSymbol) continue;

        console.log(`Fetching data for ${commodity.name} (${commodity.yahooSymbol})`);
        
        const data = await this.fetchHistoricalData(commodity.yahooSymbol);
        
        if (data?.chart?.result?.[0]) {
          const result = data.chart.result[0];
          const timestamps = result.timestamp || [];
          const quotes = result.indicators?.quote?.[0];
          
          if (quotes?.close) {
            for (let i = 0; i < timestamps.length; i++) {
              const timestamp = timestamps[i];
              const price = quotes.close[i];
              const volume = quotes.volume?.[i];

              if (price && !isNaN(price)) {
                const actualPrice: InsertActualPrice = {
                  commodityId: commodity.id,
                  date: new Date(timestamp * 1000),
                  price: price.toString(),
                  volume: volume ? volume.toString() : null,
                  source: "yahoo_finance"
                };

                await storage.createActualPrice(actualPrice);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error updating commodity prices:', error);
      throw error;
    }
  }

  async getCurrentPrice(yahooSymbol: string): Promise<{ price: number; change?: number; changePercent?: number } | null> {
    const data = await this.fetchHistoricalData(yahooSymbol, "1d");
    
    if (data?.chart?.result?.[0]?.meta) {
      const meta = data.chart.result[0].meta;
      return {
        price: meta.regularMarketPrice,
        change: meta.regularMarketChange || 0,
        changePercent: meta.regularMarketChangePercent || 0
      };
    }
    
    return null;
  }

  async fetchDetailedHistoricalData(yahooSymbol: string, period: string): Promise<any[]> {
    await this.enforceRateLimit();

    const intervalMap: Record<string, string> = {
      "1d": "5m",
      "5d": "15m", 
      "1w": "30m",
      "1mo": "1d",  // Changed from "1h" to "1d" for better data availability
      "3mo": "1d",
      "6mo": "1d",
      "1y": "1d",
      "2y": "1wk",
      "5y": "1mo",
      "10y": "1mo", // Added 10-year period
      "max": "1mo", // Added max period
    };

    const interval = intervalMap[period] || "1d";

    try {
      const data = await this.fetchHistoricalData(yahooSymbol, period, interval);
      
      if (data?.chart?.result?.[0]) {
        const result = data.chart.result[0];
        const timestamps = result.timestamp || [];
        const quotes = result.indicators?.quote?.[0];
        
        if (quotes?.close) {
          return timestamps.map((timestamp: number, i: number) => ({
            date: new Date(timestamp * 1000).toISOString(),
            price: quotes.close[i],
            volume: quotes.volume?.[i] || 0,
          })).filter(item => item.price && !isNaN(item.price));
        }
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching detailed data for ${yahooSymbol}:`, error);
      return [];
    }
  }
}

export const yahooFinanceService = new YahooFinanceService();
