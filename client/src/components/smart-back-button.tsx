import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

interface SmartBackButtonProps {
  fallbackPath?: string;
  className?: string;
}

export function SmartBackButton({ fallbackPath = "/", className = "" }: SmartBackButtonProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    console.log("SmartBackButton clicked!");
    console.log("History length:", window.history.length);
    console.log("Fallback path:", fallbackPath);
    
    // Try to go back in history first
    if (window.history.length > 1) {
      console.log("Going back in history");
      window.history.back();
    } else {
      console.log("Using fallback navigation to:", fallbackPath);
      // Fallback to home or specified path using wouter
      setLocation(fallbackPath);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Button 
        variant="ghost" 
        onClick={handleBack}
        className="flex items-center space-x-2 hover:scale-105 transition-all duration-200 text-muted-foreground hover:text-foreground relative z-50 cursor-pointer"
        style={{ pointerEvents: 'auto' }}
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span>Back</span>
      </Button>
    </motion.div>
  );
}