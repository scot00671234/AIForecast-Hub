import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { AlertTriangleIcon } from "lucide-react";
import { PageHeader } from "../components/page-header";
import { SmartBackButton } from "../components/smart-back-button";
import { motion } from "framer-motion";

export default function Policy() {
  const [location] = useLocation();
  
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
      <main className="relative z-10 max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-20">
        <SmartBackButton className="mb-12" />
          
          <motion.article 
            className="space-y-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <header className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-semibold text-foreground leading-tight tracking-tight">
                Legal Disclaimer
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                Important legal information and disclaimers
              </p>
            </header>

            <div className="space-y-12">
              <Card className="glass-card hover-lift relative overflow-hidden group">
                {/* Subtle glare effect - not too much */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="p-10 space-y-8 relative z-10">
                  <h2 className="text-3xl font-semibold text-foreground">Disclaimer</h2>
                  
                  <div className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                      The information and advice provided on this website by Loremt ApS as well as during presentations, consultations, or through any other form of communication is intended solely for general informational purposes. It does not constitute a comprehensive or exhaustive analysis of any specific situation and must not be construed as legal, financial, or professional advice.
                    </p>

                    <p className="text-muted-foreground leading-relaxed">
                      Loremt ApS makes no representations or warranties regarding the accuracy, completeness, or applicability of the information provided. All information is subject to change without notice, and Loremt ApS has no obligation to update any information once delivered or published.
                    </p>

                    <p className="text-muted-foreground leading-relaxed">
                      Any decisions or actions taken by readers, users, clients or third parties based on information or advice provided by Loremt ApS are undertaken entirely at their own risk. Loremt ApS accepts no liability for any direct, indirect, incidental, consequential, or punitive damages that may result from such decisions or actions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.article>
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
              <span className="font-semibold text-foreground">AIForecast Hub</span>
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