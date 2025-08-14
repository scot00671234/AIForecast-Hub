import { storage } from "../storage";
import type { InsertActualPrice } from "@shared/schema";

interface YahooFinanceResponse {
  chart: {
    result: Array<{
      meta: {
        symbol: string;
        regularMarketPrice: number;
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

  async fetchHistoricalData(yahooSymbol: string, period = "7d"): Promise<YahooFinanceResponse | null> {
    await this.enforceRateLimit();

    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=${period}&interval=1d`;
      
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

  async getCurrentPrice(yahooSymbol: string): Promise<number | null> {
    const data = await this.fetchHistoricalData(yahooSymbol, "1d");
    
    if (data?.chart?.result?.[0]?.meta?.regularMarketPrice) {
      return data.chart.result[0].meta.regularMarketPrice;
    }
    
    return null;
  }
}

export const yahooFinanceService = new YahooFinanceService();
