import { Button } from "@/components/ui/button";
import { ArrowRight, Github, Book } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          Start Building Today
        </h2>
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          Join the future of decentralized trust. Install PeerCert and issue your first certificate in minutes.
        </p>

        {/* Installation */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="bg-card border border-border rounded-xl p-6 text-left shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-mono">Quick Start</span>
            </div>
            <code className="text-primary font-mono text-lg block mb-4">
              npm install peercert
            </code>
            <div className="text-sm text-muted-foreground font-mono">
              import {'{'} PeerCert {'}'} from 'peercert'
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="text-lg px-8 shadow-glow-primary hover:shadow-glow-primary/70 transition-all group"
          >
            <Book className="w-5 h-5 mr-2" />
            Read Documentation
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 border-border hover:border-primary transition-all"
          >
            <Github className="w-5 h-5 mr-2" />
            View on GitHub
          </Button>
        </div>

        {/* Additional info */}
        <p className="mt-12 text-sm text-muted-foreground">
          Built on BSV blockchain • Powered by @bsv/sdk
        </p>
      </div>
    </section>
  );
};

export default CTA;
