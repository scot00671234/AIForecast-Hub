// Deepseek API Service for commodity price predictions
// Note: Deepseek uses OpenAI-compatible API format

class DeepseekService {
  private apiKey: string | undefined;
  private baseURL = 'https://api.deepseek.com/v1';

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async generatePrediction(commodityData: {
    name: string;
    symbol: string;
    currentPrice: number;
    historicalPrices: Array<{ date: string; price: number }>;
    category: string;
    unit: string;
  }): Promise<{
    predictedPrice: number;
    confidence: number;
    reasoning: string;
  }> {
    const prompt = `You are an expert commodity trader specializing in ${commodityData.category} commodities. Analyze ${commodityData.name} (${commodityData.symbol}).

Market Information:
- Current Price: $${commodityData.currentPrice} per ${commodityData.unit}
- Commodity Type: ${commodityData.category}
- Price History (last 7 days): ${this.formatHistoricalData(commodityData.historicalPrices)}

Provide a technical analysis-based price prediction for 7 days ahead. Consider:
- Price momentum and trends
- Market volatility
- Supply chain factors
- Geopolitical influences
- Seasonal patterns

Return your analysis in JSON format:
{
  "predictedPrice": <number>,
  "confidence": <number between 0 and 1>,
  "reasoning": "<concise explanation of prediction methodology>"
}`;

    if (!this.apiKey) {
      throw new Error('Deepseek not configured - missing API key');
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        throw new Error(`Deepseek API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);

      return {
        predictedPrice: Number(result.predictedPrice),
        confidence: Number(result.confidence),
        reasoning: result.reasoning
      };
    } catch (error) {
      console.error('Deepseek prediction error:', error);
      throw error;
    }
  }

  private formatHistoricalData(prices: Array<{ date: string; price: number }>): string {
    const recent = prices.slice(-7); // Last 7 days
    return recent.map(p => `${p.date}: $${p.price.toFixed(2)}`).join(', ');
  }
}

export const deepseekService = new DeepseekService();