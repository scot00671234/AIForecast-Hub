import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { ArrowLeftIcon, AlertTriangleIcon } from "lucide-react";
import { NavigationMenu } from "../components/navigation-menu";

export default function Policy() {
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
                Data Usage Policy & Disclaimers
              </h1>
              <p className="text-lg text-muted-foreground">
                How we use data and important information about AI predictions
              </p>
            </header>

            {/* Important Warning */}
            <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangleIcon className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-amber-900 dark:text-amber-100">
                      Important Disclaimer
                    </h3>
                    <p className="text-amber-800 dark:text-amber-200">
                      AI predictions are not guarantees and should not be used as the sole basis for financial decisions. Past performance does not predict future results. Always conduct your own research and consider consulting with financial professionals.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card className="bg-card/50 border border-border/40">
                <CardContent className="p-8 space-y-6">
                  <h2 className="text-2xl font-medium text-foreground">Data Collection & Sources</h2>
                  
                  <h3 className="text-xl font-medium text-foreground">Real Market Data</h3>
                  <p className="text-foreground leading-relaxed">
                    All commodity price data displayed on AIForecast Hub is sourced directly from Yahoo Finance through their public API. This includes:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-foreground">
                    <li>Historical price data for 10 major commodities</li>
                    <li>Real-time price updates during market hours</li>
                    <li>Volume and market capitalization information where available</li>
                    <li>Price change calculations and trend analysis</li>
                  </ul>

                  <h3 className="text-xl font-medium text-foreground mt-6">AI Prediction Data</h3>
                  <p className="text-foreground leading-relaxed">
                    Our platform generates predictions using three major AI models:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-foreground">
                    <li><strong>Claude (Anthropic):</strong> Advanced reasoning and analysis capabilities</li>
                    <li><strong>ChatGPT (OpenAI):</strong> GPT-4 and GPT-4o models for market insights</li>
                    <li><strong>Deepseek:</strong> Specialized models for financial forecasting</li>
                  </ul>

                  <p className="text-foreground leading-relaxed">
                    Predictions are generated weekly every Monday at 2:00 AM UTC, providing 7-day forward-looking price forecasts based on current market conditions, historical trends, and each model's analytical approach.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border border-border/40">
                <CardContent className="p-8 space-y-6">
                  <h2 className="text-2xl font-medium text-foreground">How We Use Your Data</h2>
                  
                  <h3 className="text-xl font-medium text-foreground">No Personal Data Collection</h3>
                  <p className="text-foreground leading-relaxed">
                    AIForecast Hub does not collect, store, or process personal information from users. We do not require account creation, email addresses, or any form of user registration.
                  </p>

                  <h3 className="text-xl font-medium text-foreground mt-6">Technical Data</h3>
                  <p className="text-foreground leading-relaxed">
                    We may collect standard web analytics data to improve our service:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-foreground">
                    <li>Anonymous usage statistics and page views</li>
                    <li>Technical information about browser types and device preferences</li>
                    <li>Performance metrics to optimize loading times and user experience</li>
                  </ul>

                  <h3 className="text-xl font-medium text-foreground mt-6">Data Storage</h3>
                  <p className="text-foreground leading-relaxed">
                    All market data and AI predictions are stored in secure databases for historical analysis and comparison purposes. This data is used exclusively for:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-foreground">
                    <li>Calculating accuracy metrics and performance comparisons</li>
                    <li>Generating historical charts and trend analysis</li>
                    <li>Improving our prediction algorithms and data processing</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border border-border/40">
                <CardContent className="p-8 space-y-6">
                  <h2 className="text-2xl font-medium text-foreground">Limitations & Disclaimers</h2>
                  
                  <h3 className="text-xl font-medium text-foreground">Prediction Accuracy</h3>
                  <p className="text-foreground leading-relaxed">
                    While our AI models use sophisticated algorithms and extensive market data, predictions are inherently uncertain and should be understood as:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-foreground">
                    <li>Educated estimates based on available information at the time of generation</li>
                    <li>Subject to rapid change due to unforeseen market events</li>
                    <li>Historical performance that does not guarantee future accuracy</li>
                    <li>One factor among many that should inform decision-making</li>
                  </ul>

                  <h3 className="text-xl font-medium text-foreground mt-6">Market Volatility</h3>
                  <p className="text-foreground leading-relaxed">
                    Commodity markets are subject to extreme volatility driven by factors including but not limited to:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-foreground">
                    <li>Geopolitical events and international conflicts</li>
                    <li>Natural disasters and weather patterns</li>
                    <li>Supply chain disruptions and regulatory changes</li>
                    <li>Economic policy shifts and currency fluctuations</li>
                  </ul>

                  <h3 className="text-xl font-medium text-foreground mt-6">No Financial Advice</h3>
                  <p className="text-foreground leading-relaxed">
                    AIForecast Hub is designed for informational and educational purposes only. We do not provide financial, investment, or trading advice. Users should:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-foreground">
                    <li>Conduct independent research before making investment decisions</li>
                    <li>Consult with qualified financial advisors</li>
                    <li>Consider their risk tolerance and investment objectives</li>
                    <li>Never invest more than they can afford to lose</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border border-border/40">
                <CardContent className="p-8 space-y-6">
                  <h2 className="text-2xl font-medium text-foreground">Contact & Updates</h2>
                  
                  <p className="text-foreground leading-relaxed">
                    This policy may be updated periodically to reflect changes in our data practices or legal requirements. Users are encouraged to review this page regularly for any updates.
                  </p>

                  <p className="text-foreground leading-relaxed">
                    For questions about our data usage practices or to report technical issues, please refer to our support documentation or contact our development team through the appropriate channels.
                  </p>

                  <p className="text-sm text-muted-foreground mt-6">
                    Last updated: January 16, 2025
                  </p>
                </CardContent>
              </Card>
            </div>
          </article>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border/30">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 AIForecast Hub
          </p>
        </div>
      </footer>
    </div>
  );
}