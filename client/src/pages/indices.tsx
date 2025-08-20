import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NavigationMenu } from "../components/navigation-menu";
import { useLocation } from "wouter";
import { TrendingUpIcon, TrendingDownIcon, ActivityIcon } from "lucide-react";
import BottomBanner from "@/components/ads/BottomBanner";

interface CompositeIndex {
  value: number;
  timestamp: string;
  components: {
    directional: number;
    confidence: number;
    accuracy: number;
    momentum: number;
  };
}

interface FearGreedIndex {
  value: number;
  classification: string;
  timestamp: string;
  previousClose: number;
}

interface CategoryCompositeIndex {
  hard: CompositeIndex;
  soft: CompositeIndex;
}

function IndexGauge({ value, title, subtitle, classification }: {
  value: number;
  title: string;
  subtitle: string;
  classification?: string;
}) {
  const getColor = (val: number) => {
    if (val >= 75) return "text-green-600 dark:text-green-400";
    if (val >= 60) return "text-green-500 dark:text-green-300";
    if (val >= 40) return "text-yellow-500 dark:text-yellow-300";
    if (val >= 25) return "text-orange-500 dark:text-orange-300";
    return "text-red-500 dark:text-red-300";
  };

  const getBgColor = (val: number) => {
    if (val >= 75) return "bg-green-100 dark:bg-green-900/20";
    if (val >= 60) return "bg-green-50 dark:bg-green-900/10";
    if (val >= 40) return "bg-yellow-50 dark:bg-yellow-900/10";
    if (val >= 25) return "bg-orange-50 dark:bg-orange-900/10";
    return "bg-red-50 dark:bg-red-900/10";
  };

  const getIcon = (val: number) => {
    if (val >= 50) return <TrendingUpIcon className="h-5 w-5" />;
    return <TrendingDownIcon className="h-5 w-5" />;
  };

  return (
    <Card className={`${getBgColor(value)} border-2`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          {title}
          <div className={`${getColor(value)} flex items-center`}>
            {getIcon(value)}
          </div>
        </CardTitle>
        <CardDescription className="text-sm">{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className={`text-4xl font-bold ${getColor(value)}`}>
            {value.toFixed(1)}
          </div>
          <div className="text-right text-sm text-muted-foreground">
            {classification && (
              <div className={`font-medium ${getColor(value)}`}>
                {classification}
              </div>
            )}
            <div>out of 100</div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4 w-full bg-muted/30 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              value >= 75 ? 'bg-green-500' :
              value >= 60 ? 'bg-green-400' :
              value >= 40 ? 'bg-yellow-400' :
              value >= 25 ? 'bg-orange-400' : 'bg-red-400'
            }`}
            style={{ width: `${Math.max(2, value)}%` }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Indices() {
  const [location] = useLocation();

  const { data: overallComposite, isLoading: loadingOverall } = useQuery<CompositeIndex>({
    queryKey: ["/api/composite-index/latest"],
  });

  const { data: fearGreedIndex, isLoading: loadingFearGreed } = useQuery<FearGreedIndex>({
    queryKey: ["/api/fear-greed-index"],
  });

  const { data: categoryComposite, isLoading: loadingCategories } = useQuery<CategoryCompositeIndex>({
    queryKey: ["/api/composite-index/categories"],
  });

  return (
    <div className="min-h-screen bg-background relative">
      {/* Minimal geometric background pattern */}
      <div className="absolute inset-0 text-foreground pointer-events-none">
        <svg className="w-full h-full object-cover opacity-20" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="indicesGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
            </pattern>
            <linearGradient id="indicesFadeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:"currentColor", stopOpacity:0.03}} />
              <stop offset="50%" style={{stopColor:"currentColor", stopOpacity:0.01}} />
              <stop offset="100%" style={{stopColor:"currentColor", stopOpacity:0.04}} />
            </linearGradient>
          </defs>
          <rect width="800" height="600" fill="url(#indicesGrid)" />
          <rect width="800" height="600" fill="url(#indicesFadeGradient)" />
        </svg>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-foreground"></div>
            <h1 className="font-bold text-xl text-foreground">AIForecast Hub</h1>
          </div>
          
          <NavigationMenu currentPath={location} />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-8 md:py-16">
        <div className="space-y-8 md:space-y-16">
          
          {/* Page Title */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Market Indices
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Real-time market sentiment and AI-powered commodity indices for comprehensive market analysis
            </p>
          </div>

          {/* Overall AI Commodity Composite Index */}
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                AI Commodity Composite Index
              </h2>
              <p className="text-muted-foreground">
                Combined intelligence from Claude, ChatGPT, and DeepSeek across all commodities
              </p>
            </div>

            {loadingOverall ? (
              <Card className="bg-muted/10">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin">
                      <ActivityIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <IndexGauge
                value={overallComposite?.value || 50}
                title="Overall Market Sentiment"
                subtitle="AI-powered composite across all commodities"
                classification={
                  (overallComposite?.value || 50) >= 75 ? "Extremely Bullish" :
                  (overallComposite?.value || 50) >= 60 ? "Bullish" :
                  (overallComposite?.value || 50) >= 40 ? "Neutral" :
                  (overallComposite?.value || 50) >= 25 ? "Bearish" : "Extremely Bearish"
                }
              />
            )}
          </section>

          {/* Fear & Greed Index */}
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Fear & Greed Index
              </h2>
              <p className="text-muted-foreground">
                Market sentiment based on volatility, momentum, and investor behavior
              </p>
            </div>

            {loadingFearGreed ? (
              <Card className="bg-muted/10">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin">
                      <ActivityIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <IndexGauge
                value={fearGreedIndex?.value || 50}
                title="Market Fear & Greed"
                subtitle="Based on market volatility and investor sentiment"
                classification={fearGreedIndex?.classification || "Neutral"}
              />
            )}
          </section>

          {/* Hard vs Soft Commodities */}
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Commodity Categories
              </h2>
              <p className="text-muted-foreground">
                Separate AI indices for hard commodities (metals, energy) and soft commodities (agriculture)
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Hard Commodities */}
              {loadingCategories ? (
                <Card className="bg-muted/10">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin">
                        <ActivityIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <IndexGauge
                  value={categoryComposite?.hard?.value || 50}
                  title="Hard Commodities"
                  subtitle="Metals, Energy & Industrial Materials"
                  classification={
                    (categoryComposite?.hard?.value || 50) >= 75 ? "Very Bullish" :
                    (categoryComposite?.hard?.value || 50) >= 60 ? "Bullish" :
                    (categoryComposite?.hard?.value || 50) >= 40 ? "Neutral" :
                    (categoryComposite?.hard?.value || 50) >= 25 ? "Bearish" : "Very Bearish"
                  }
                />
              )}

              {/* Soft Commodities */}
              {loadingCategories ? (
                <Card className="bg-muted/10">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin">
                        <ActivityIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <IndexGauge
                  value={categoryComposite?.soft?.value || 50}
                  title="Soft Commodities"
                  subtitle="Agricultural Products & Food"
                  classification={
                    (categoryComposite?.soft?.value || 50) >= 75 ? "Very Bullish" :
                    (categoryComposite?.soft?.value || 50) >= 60 ? "Bullish" :
                    (categoryComposite?.soft?.value || 50) >= 40 ? "Neutral" :
                    (categoryComposite?.soft?.value || 50) >= 25 ? "Bearish" : "Very Bearish"
                  }
                />
              )}
            </div>
          </section>

          {/* Index Methodology */}
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Index Methodology
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-muted/5">
                <CardHeader>
                  <CardTitle className="text-lg">AI Composite Index</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <div>• <strong>Directional Sentiment</strong>: 40%</div>
                  <div>• <strong>Confidence Score</strong>: 25%</div>
                  <div>• <strong>Accuracy Weight</strong>: 20%</div>
                  <div>• <strong>Momentum Component</strong>: 15%</div>
                </CardContent>
              </Card>

              <Card className="bg-muted/5">
                <CardHeader>
                  <CardTitle className="text-lg">Fear & Greed Index</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <div>• Market volatility analysis</div>
                  <div>• Price momentum indicators</div>
                  <div>• Volume analysis</div>
                  <div>• Put/call ratios</div>
                </CardContent>
              </Card>

              <Card className="bg-muted/5">
                <CardHeader>
                  <CardTitle className="text-lg">Category Indices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <div>• <strong>Hard</strong>: Energy, Metals</div>
                  <div>• <strong>Soft</strong>: Agricultural</div>
                  <div>• Same AI methodology</div>
                  <div>• Category-specific insights</div>
                </CardContent>
              </Card>
            </div>
          </section>

        </div>
      </main>

      {/* Bottom Banner Ad */}
      <BottomBanner />

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 mt-16 md:mt-32">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-8 md:py-16">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-foreground"></div>
              <span className="font-bold text-lg text-foreground">AIForecast Hub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Loremt ApS CVR-nr 41691360. Professional commodity forecasting platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}