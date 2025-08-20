import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { ArrowLeftIcon } from "lucide-react";
import { NavigationMenu } from "../components/navigation-menu";

export default function Blog() {
  const [location] = useLocation();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 w-full z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-foreground"></div>
              <span className="text-lg font-medium text-foreground">AIForecast Hub</span>
            </Link>
            
            <NavigationMenu currentPath={location} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-20">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="flex items-center space-x-2 mb-6">
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
          
          <article className="space-y-8">
            <header className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-normal text-foreground leading-tight">
                The Future of AI-Powered Commodity Forecasting
              </h1>
              <p className="text-lg text-muted-foreground">
                How artificial intelligence is revolutionizing commodity price predictions
              </p>
              <div className="text-sm text-muted-foreground">
                Published on January 16, 2025
              </div>
            </header>

            <Card className="bg-card/50 border border-border/40">
              <CardContent className="p-8 space-y-6">
                <h2 className="text-2xl font-medium text-foreground">The Purpose Behind AIForecast Hub</h2>
                
                <p className="text-foreground leading-relaxed">
                  In an era where artificial intelligence is reshaping industries, commodity trading stands at the forefront of this transformation. AIForecast Hub was created to bridge the gap between cutting-edge AI technology and practical market insights, providing traders, investors, and analysts with unprecedented clarity into how different AI models perform in real-world forecasting scenarios.
                </p>

                <h3 className="text-xl font-medium text-foreground mt-8">Why Compare AI Models?</h3>
                
                <p className="text-foreground leading-relaxed">
                  Not all AI models are created equal. While Claude, ChatGPT, and Deepseek each bring unique strengths to the table, their performance can vary significantly across different commodities and market conditions. Our platform provides comprehensive analysis of:
                </p>

                <ul className="list-disc pl-6 space-y-2 text-foreground">
                  <li>Prediction accuracy across 10 major commodities including oil, gold, natural gas, and agricultural products</li>
                  <li>Performance consistency over various time periods (7-day, 30-day, 90-day windows)</li>
                  <li>Model behavior during market volatility and trending periods</li>
                  <li>Comparative analysis to help users choose the most reliable AI model for their specific needs</li>
                </ul>

                <h3 className="text-xl font-medium text-foreground mt-8">Real Data, Real Insights</h3>
                
                <p className="text-foreground leading-relaxed">
                  Our platform integrates directly with Yahoo Finance to ensure all commodity price data is authentic and up-to-date. Every Monday, our system generates fresh 7-day predictions from all three AI models, creating a continuously updated dataset that reflects current market conditions and model performance.
                </p>

                <p className="text-foreground leading-relaxed">
                  This approach ensures that users receive genuine insights based on real market data, not synthetic or outdated information. The result is a reliable resource for understanding how AI models actually perform in today's dynamic commodity markets.
                </p>

                <h3 className="text-xl font-medium text-foreground mt-8">The Technology Stack</h3>
                
                <p className="text-foreground leading-relaxed">
                  Built with modern web technologies and designed for scalability, AIForecast Hub leverages:
                </p>

                <ul className="list-disc pl-6 space-y-2 text-foreground">
                  <li>React with TypeScript for a robust, type-safe frontend</li>
                  <li>Real-time data integration with Yahoo Finance API</li>
                  <li>PostgreSQL database for reliable data storage and historical tracking</li>
                  <li>Advanced charting capabilities with interactive visualizations</li>
                  <li>Responsive design optimized for desktop and mobile use</li>
                </ul>

                <h3 className="text-xl font-medium text-foreground mt-8">Looking Forward</h3>
                
                <p className="text-foreground leading-relaxed">
                  As AI technology continues to evolve, so too will the capabilities of commodity forecasting. AIForecast Hub represents not just a current snapshot of AI performance, but a foundation for understanding how these models improve over time. We're committed to expanding our analysis, adding new commodities, and providing even deeper insights into the fascinating world of AI-powered market prediction.
                </p>

                <p className="text-foreground leading-relaxed">
                  Whether you're a seasoned trader looking to leverage AI insights, a data scientist studying model performance, or simply curious about the intersection of artificial intelligence and financial markets, AIForecast Hub provides the tools and data you need to make informed decisions.
                </p>
              </CardContent>
            </Card>
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border/30">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>© 2025 AIForecast Hub</p>
            <p>Loremt ApS CVR-nr 41691360</p>
          </div>
        </div>
      </footer>
    </div>
  );
}