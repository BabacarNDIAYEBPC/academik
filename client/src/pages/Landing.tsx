import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BookOpen, GraduationCap, Sparkles, BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg">
              A
            </div>
            <span className="font-bold text-xl tracking-tight">Academic</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden sm:flex">Features</Button>
            <Button variant="ghost" className="hidden sm:flex">Pricing</Button>
            <a href="/api/login">
              <Button>Sign In</Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium inline-block mb-6">
              Powered by Advanced AI
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
              Master Your Academic <br />
              <span className="gradient-text">Writing Journey</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Whether it's a Mémoire, TFE, or VAE, get intelligent assistance to structure, analyze, and write your academic papers with confidence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/api/login">
                <Button size="lg" className="h-12 px-8 text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                View Demo
              </Button>
            </div>
          </motion.div>
        </div>
        
        {/* Abstract visual */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 h-full w-full pointer-events-none" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-80">
            {/* Unsplash abstract academic images */}
            {/* Library interior */}
            <img 
              src="https://pixabay.com/get/ga028dda5ddb27a32603d21f6efbab6ee4da5e80c13663539447048311d743df1c37ec1af01f43a5c9d51cec235f334b9880f5fc10f54898e8693ce1cd7015fa0_1280.jpg" 
              alt="Academic Library" 
              className="rounded-2xl shadow-2xl transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500 h-64 w-full object-cover"
            />
            {/* Writing workspace */}
            <img 
              src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80" 
              alt="Writing Workspace" 
              className="rounded-2xl shadow-2xl transform translate-y-8 hover:translate-y-4 transition-transform duration-500 h-64 w-full object-cover"
            />
            {/* Student studying */}
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80" 
              alt="Student Collaboration" 
              className="rounded-2xl shadow-2xl transform rotate-[2deg] hover:rotate-0 transition-transform duration-500 h-64 w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={GraduationCap}
              title="Mémoire Helper"
              desc="Generate robust problematics and hypotheses tailored to your field of study."
            />
            <FeatureCard 
              icon={BookOpen}
              title="TFE Support"
              desc="Analyze situational contexts and derive key academic questions instantly."
            />
            <FeatureCard 
              icon={Sparkles}
              title="VAE Assistant"
              desc="Transform your professional experience into validated academic competencies."
            />
            <FeatureCard 
              icon={BrainCircuit}
              title="AI Analysis"
              desc="Deep content analysis to ensure your arguments are logical and well-structured."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <Card className="bg-background border-border/50 hover:shadow-lg transition-all duration-300">
      <CardContent className="pt-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  );
}
