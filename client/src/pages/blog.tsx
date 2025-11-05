import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { ArrowRightIcon, CalendarIcon, ClockIcon } from "lucide-react";
import { PageHeader } from "../components/page-header";
import { SmartBackButton } from "../components/smart-back-button";
import { motion } from "framer-motion";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  publishedDate: string;
  readTime: string;
  category: string;
}

const blogPosts: BlogPost[] = [
  {
    id: "ai-oracle-showdown-tech-stocks",
    title: "The AI Oracle Showdown: Which AI Tool Best Predicts Tech Stock Prices?",
    excerpt: "A comparative analysis reveals surprising accuracy—and significant blind spots—in AI-powered stock predictions",
    content: "In an era where artificial intelligence promises to revolutionize everything from healthcare to transportation, a critical question emerges: Can AI accurately predict the future prices of the world's most valuable technology stocks?",
    publishedDate: "November 1, 2025",
    readTime: "8 min read",
    category: "AI & Markets"
  },
  {
    id: "ai-currency-forecasting-face-off",
    title: "The AI Currency Forecasting Face-Off: Which Tools Can Actually Predict Exchange Rates?",
    excerpt: "An analysis of ChatGPT, Claude, Co-Pilot, and DeepSeek's accuracy in predicting major currency pairs",
    content: "In an era where artificial intelligence promises to revolutionize financial forecasting, we put four leading AI tools to the test: ChatGPT, Claude, Co-Pilot, and DeepSeek.",
    publishedDate: "November 1, 2025",
    readTime: "9 min read",
    category: "AI & Markets"
  }
];

export default function Blog() {
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
      <main className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <SmartBackButton className="mb-12" />
        
        {/* Page Header */}
        <motion.div 
          className="text-center space-y-4 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-semibold text-foreground leading-tight tracking-tight">
            Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Insights, analysis, and perspectives on AI-powered commodity forecasting
          </p>
        </motion.div>

        {/* Blog Posts Grid */}
        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {blogPosts.map((post, index) => (
            <BlogPostCard key={post.id} post={post} index={index} />
          ))}
        </motion.div>
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

function BlogPostCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
    >
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group cursor-pointer relative overflow-hidden">
        {/* Subtle glare effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="p-8 relative z-10">
          <div className="space-y-4">
            {/* Category & Metadata */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                {post.category}
              </span>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="h-3 w-3" />
                  <span>{post.publishedDate}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-3 w-3" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>

            {/* Title & Excerpt */}
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
            </div>

            {/* Read More Button */}
            <Link href={`/blog/${post.id}`}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-auto text-foreground hover:text-primary transition-colors group-hover:translate-x-1 transform duration-200"
              >
                <span className="text-sm font-medium">Read article</span>
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}