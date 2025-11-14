import { Button } from "@/components/ui/button";
import { ArrowRight, Github } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-[90vh] flex items-center px-6 py-32">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left column - Text */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight">
                Direct.
                <br />
                Verified.
                <br />
                Trusted.
              </h1>
              
              <div className="w-16 h-1 bg-accent" />
              
              <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-xl">
                Issue certificates directly between peers. No servers, no intermediaries—just pure cryptographic trust.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-base group">
                Read Documentation
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="text-base">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </div>
          </div>

          {/* Right column - Code */}
          <div className="lg:pl-8">
            <div className="bg-foreground text-background p-8 rounded-sm shadow-2xl">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-background/20">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span className="text-sm font-mono text-background/60">Quick Start</span>
              </div>
              
              <pre className="text-sm font-mono leading-relaxed overflow-x-auto">
                <code className="text-background/90">
{`npm install peercert

import { PeerCert } from 'peercert'

const peercert = new PeerCert()

await peercert.issue({
  certificateType: 'employment',
  subjectIdentityKey: peer,
  fields: {
    role: 'Engineer',
    company: 'ACME Corp'
  },
  autoSend: true
})`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
