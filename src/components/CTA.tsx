import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ctaBackground from "@/assets/cta-background.png";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
const CTA = () => {
  return <section className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src={ctaBackground} alt="Background" className="w-full h-full object-cover" />
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
          <div className="bg-foreground rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
            {/* Terminal window controls */}
            <div className="bg-foreground/90 px-4 py-3 flex items-center gap-2 border-b border-white/10">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-3 text-sm text-background/60 font-mono">
            </span>
            </div>
            
            {/* Code content */}
            <div className="p-6">
              <SyntaxHighlighter language="bash" style={vscDarkPlus} customStyle={{
              background: 'transparent',
              padding: 0,
              margin: 0,
              fontSize: '0.875rem'
            }} codeTagProps={{
              style: {
                fontFamily: 'monospace'
              }
            }}>
                {`npm install peercert`}
              </SyntaxHighlighter>
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

        
        
        <p className="text-sm font-light pt-16 text-white/60">
          © 2025 Peer-to-peer Privacy Systems Research, LLC
        </p>
      </div>
    </section>;
};
export default CTA;