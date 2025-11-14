import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ctaBackground from "@/assets/cta-background.png";

const CTA = () => {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src={ctaBackground} 
          alt="Background" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
        <div className="space-y-6">
          <h2 className="font-serif text-5xl md:text-7xl font-bold leading-tight text-white">
            Start building today
          </h2>
          <p className="text-xl md:text-2xl font-light max-w-2xl mx-auto text-white/90">
            Install PeerCert and issue your first certificate in minutes.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-foreground text-background p-8 rounded-sm">
            <div className="text-left space-y-4">
              <div className="text-sm text-background/60 font-mono">Terminal</div>
              <div className="font-mono text-lg">npm install peercert</div>
              <div className="pt-4 border-t border-background/20 text-sm text-background/60 font-mono">
                import {'{'} PeerCert {'}'} from 'peercert'
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Button size="lg" className="text-base group" asChild>
            <Link to="/docs">
              Read Documentation
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="text-base" asChild>
            <a href="#docs">
              Get Started
            </a>
          </Button>
        </div>

        <p className="text-sm font-light pt-8 text-white/70">
          Built on BSV blockchain • Powered by @bsv/sdk
        </p>
      </div>
    </section>
  );
};

export default CTA;
