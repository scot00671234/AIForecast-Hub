import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { HelpCircleIcon } from "lucide-react";
import { PageHeader } from "../components/page-header";
import { SmartBackButton } from "../components/smart-back-button";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const [location] = useLocation();
  const [accordionValue, setAccordionValue] = useState<string>("");

  const handleAccordionChange = (value: string) => {
    console.log("FAQ Accordion clicked! Value:", value);
    setAccordionValue(value);
  };
  
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
      id: "contact",
      question: "How can I get in touch or provide feedback?",
      answer: "We welcome feedback and suggestions for improving AIForecast Hub. You can reach us through our official channels. We're constantly working to enhance the platform based on user needs and market developments."
    }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Dark corporate background matching landing page */}
      <div className="absolute inset-0">
        {/* Dark gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/1 via-black/2 to-black/4" />
        
        {/* Subtle geometric patterns overlay */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="corporateGrid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="0.3"/>
                <circle cx="40" cy="40" r="1" fill="currentColor" opacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#corporateGrid)" />
          </svg>
        </div>
        
        {/* Subtle accent lines */}
        <div className="absolute top-1/4 left-1/4 w-24 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
        <div className="absolute top-3/4 right-1/4 w-20 h-px bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent" />
      </div>
      {/* Header */}
      <PageHeader currentPath={location} />

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-24">
        <SmartBackButton className="mb-12" />
        
        {/* Hero Section */}
        <motion.section 
          className="text-center mb-20 md:mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6 sm:mb-8 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            Everything you need to know about AI commodity prediction tracking and platform functionality.
          </p>
        </motion.section>

        <div className="space-y-12 md:space-y-16">
          {/* FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 relative overflow-hidden group">
              {/* Subtle glare effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <CardHeader className="pb-6 relative z-10">
                <CardTitle className="flex items-center gap-3 text-2xl font-semibold">
                  <HelpCircleIcon className="h-6 w-6" />
                  Common Questions
                </CardTitle>
              </CardHeader>
            <CardContent className="p-6 relative z-10">
              <Accordion 
                type="single" 
                collapsible 
                className="w-full"
                value={accordionValue}
                onValueChange={handleAccordionChange}
                style={{ pointerEvents: 'auto' }}
              >
                {faqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id} className="border-b">
                    <AccordionTrigger 
                      className="text-left hover:no-underline py-4 font-medium transition-all hover:bg-muted/50"
                      style={{ pointerEvents: 'auto' }}
                    >
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
          </motion.div>

          {/* Still Have Questions */}
          <motion.section 
            className="text-center py-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 relative overflow-hidden group">
              {/* Subtle glare effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-10 relative z-10">
                <h3 className="text-2xl font-semibold text-foreground mb-6">
                  Still Have Questions?
                </h3>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                  Explore our dashboard to see AI prediction tracking in action, or read our detailed methodology in the blog.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button asChild size="lg" className="font-semibold">
                    <Link href="/dashboard">
                      View Dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" asChild size="lg" className="font-semibold">
                    <Link href="/about">
                      Learn More
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="relative z-10 border-t border-border/30 mt-20 md:mt-32">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-20">
          <motion.div 
            className="text-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center space-x-3">
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-foreground"></div>
              <span className="text-lg font-semibold text-foreground">AIForecast Hub</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-3">
              <div className="space-y-1">
                <p>© 2025 AIForecast Hub</p>
                <p className="text-xs">Loremt ApS CVR-nr 41691360</p>
              </div>
              <p className="text-xs opacity-75 leading-relaxed max-w-2xl mx-auto">
                Legal Disclaimer: Information provided is for general informational purposes only and does not constitute legal, financial, or professional advice. Loremt ApS accepts no responsibility or liability for decisions made based on this information.
              </p>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}