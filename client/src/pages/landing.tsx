import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ChevronRightIcon, BarChart3Icon, TrendingUpIcon, ZapIcon } from "lucide-react";
import { ThemeToggle } from "../components/theme-toggle";

export default function Landing() {
  const [, navigate] = useLocation();

  const handleContinue = () => {
    navigate("/dashboard");
  };

  const features = [
    {
      icon: BarChart3Icon,
      title: "Real-time Tracking",
      description: "Live commodity price data from Yahoo Finance with comprehensive market coverage"
    },
    {
      icon: TrendingUpIcon,
      title: "AI Model Comparison",
      description: "Compare prediction accuracy between Claude, ChatGPT, and Deepseek models"
    },
    {
      icon: ZapIcon,
      title: "Performance Analytics",
      description: "Detailed accuracy metrics and league tables to track AI performance over time"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-600/20 to-cyan-600/20 rounded-full blur-3xl"></div>
      
      {/* Header */}
      <header className="relative z-50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <span className="text-xl font-semibold text-white tracking-tight">
                AIForecast Hub
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 md:pt-32 lg:pt-40 pb-32 text-center">
          <div className="space-y-12">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.9] tracking-tight">
                Compare AI
                <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                  Prediction Accuracy
                </span>
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light">
              Track and analyze how well Claude, ChatGPT, and Deepseek predict commodity prices. Real-time data, comprehensive analytics, and performance insights.
            </p>
            
            <div className="pt-12">
              <Button
                onClick={handleContinue}
                size="lg"
                className="h-14 md:h-16 px-10 md:px-14 text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 hover:scale-105 shadow-2xl shadow-blue-500/25"
                data-testid="continue-button"
              >
                Continue to Dashboard
                <ChevronRightIcon className="w-5 h-5 ml-3" />
              </Button>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mt-32">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.title}
                  className="group relative p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:bg-white/10"
                  data-testid={`feature-${index}`}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-4 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>


      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/10 mt-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-sm"></div>
              </div>
              <span className="font-medium text-white">AIForecast Hub</span>
            </div>
            <p className="text-sm text-slate-400">
              © 2024 AIForecast Hub. Built with real-time Yahoo Finance data.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}