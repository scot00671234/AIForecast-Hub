import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { HelpCircleIcon } from "lucide-react";
import { NavigationMenu } from "../components/navigation-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const [location] = useLocation();
  
  const faqs = [
    {
      id: "accuracy",
      question: "How do you calculate AI prediction accuracy?",
      answer: "We use multiple metrics including Mean Absolute Percentage Error (MAPE), directional accuracy (whether predictions correctly identify price direction), and threshold-based analysis. Each AI model's predictions are compared against actual market prices at the prediction timeframe endpoints (3, 6, 9, and 12 months)."
    },
    {
      id: "models", 
      question: "Which AI models do you track and why?",
      answer: "We currently track Claude (Anthropic), ChatGPT (OpenAI), and Deepseek. These models were chosen for their advanced reasoning capabilities, market analysis skills, and widespread adoption. We plan to add more AI models as they become available and demonstrate commodity prediction capabilities."
    },
    {
      id: "data-sources",
      question: "Where does your price data come from?",
      answer: "All commodity price data is sourced directly from Yahoo Finance API, providing real-time and historical market data. This ensures consistency, reliability, and industry-standard pricing information for accurate prediction evaluation."
    },
    {
      id: "prediction-frequency",
      question: "How often are new predictions generated?",
      answer: "New AI predictions are generated monthly on the 1st of each month. This provides sufficient time for meaningful price movements while maintaining a robust dataset for accuracy analysis. Each prediction includes 3, 6, 9, and 12-month forecasts."
    },
    {
      id: "commodities",
      question: "What commodities do you track?",
      answer: "We track 14 major commodities across multiple categories: Energy (Crude Oil, Natural Gas), Precious Metals (Gold, Silver, Platinum, Palladium), Industrial Metals (Copper, Aluminum), and Soft Commodities (Coffee, Sugar, Corn, Soybeans, Cotton, Wheat)."
    },
    {
      id: "free-access",
      question: "Is the platform free to use?",
      answer: "Yes, AIForecast Hub is completely free to use. Our mission is to provide transparent AI prediction analysis to help users make informed decisions. All dashboards, analytics, and historical data are accessible without any fees or subscriptions."
    },
    {
      id: "methodology",
      question: "What methodology do AI models use for predictions?",
      answer: "Each AI model analyzes multiple factors including historical price patterns, market trends, economic indicators, geopolitical events, and supply/demand dynamics. The specific prompts and analysis frameworks are designed to ensure comprehensive market evaluation while maintaining consistency across models."
    },
    {
      id: "reliability",
      question: "How reliable are AI commodity predictions?",
      answer: "AI predictions should be viewed as analytical tools rather than guaranteed forecasts. Our platform's purpose is to track and compare AI model performance transparently. Historical accuracy data helps users understand which models perform better under different market conditions, but no prediction system is infallible."
    },
    {
      id: "updates",
      question: "How often is the data updated?",
      answer: "Price data is updated in real-time during market hours through Yahoo Finance integration. Prediction accuracy metrics and rankings are recalculated daily. The dashboard reflects the most current performance data available for comprehensive analysis."
    },
    {
      id: "mobile",
      question: "Is the platform mobile-friendly?",
      answer: "Yes, AIForecast Hub is fully responsive and optimized for mobile devices. All features, charts, and analytics are accessible on smartphones and tablets, ensuring you can track AI prediction performance wherever you are."
    },
    {
      id: "api",
      question: "Do you offer an API for developers?",
      answer: "We're currently developing API access for developers and institutional users. This will allow programmatic access to prediction data, accuracy metrics, and historical performance. Contact us if you're interested in early access to our API services."
    },
    {
      id: "contact",
      question: "How can I get in touch or provide feedback?",
      answer: "We welcome feedback and suggestions for improving AIForecast Hub. You can reach us through our blog comments, or through our official channels. We're constantly working to enhance the platform based on user needs and market developments."
    }
  ];

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
        
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-normal text-foreground mb-6 tracking-wide">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about AI commodity prediction tracking and platform functionality.
          </p>
        </section>

        <div className="space-y-8">
          {/* FAQ Accordion */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <HelpCircleIcon className="h-5 w-5" />
                Common Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Still Have Questions */}
          <section className="text-center py-8">
            <Card className="border-0 shadow-sm bg-muted/30">
              <CardContent className="p-8">
                <h3 className="text-xl font-medium text-foreground mb-4">
                  Still Have Questions?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Explore our dashboard to see AI prediction tracking in action, or read our detailed methodology in the blog.
                </p>
                <div className="flex justify-center gap-4">
                  <Button asChild>
                    <Link href="/dashboard">
                      View Dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/about">
                      Learn More
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
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