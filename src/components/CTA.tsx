import { Button } from "@/components/ui/button";
import { ArrowRight, Github } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-32 px-6 bg-muted/30">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        <div className="space-y-6">
          <h2 className="font-serif text-5xl md:text-7xl font-bold leading-tight">
            Start building today
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto">
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
          <Button size="lg" className="text-base group">
            Read Documentation
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button size="lg" variant="outline" className="text-base">
            <Github className="w-4 h-4 mr-2" />
            View on GitHub
          </Button>
        </div>

        <p className="text-sm text-muted-foreground font-light pt-8">
          Built on BSV blockchain • Powered by @bsv/sdk
        </p>
      </div>
    </section>
  );
};

export default CTA;
