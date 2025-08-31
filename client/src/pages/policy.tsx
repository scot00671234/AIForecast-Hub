import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { AlertTriangleIcon } from "lucide-react";
import { NavigationMenu } from "../components/navigation-menu";
import { SmartBackButton } from "../components/smart-back-button";
import { motion } from "framer-motion";

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
              <Card className="bg-background/50 border-border/30 hover:bg-background/80 transition-colors duration-300">
                <CardContent className="p-10 space-y-8">
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