import { Button } from "@/components/ui/button";
import { ArrowRight, Github, ChevronDown } from "lucide-react";
import heroBackground from "@/assets/hero-background.png";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
const Hero = () => {
  return <section className="relative min-h-screen flex items-center px-6 py-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-no-repeat" style={{
      backgroundImage: `url(${heroBackground})`,
      backgroundPosition: 'center 40%'
    }} />
      
      {/* Subtle gradient for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 via-transparent to-foreground/40" />
      
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left column - Text */}
          <div className="space-y-8 pl-4 md:pl-6">
            <div className="space-y-6">
              <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight text-white drop-shadow-lg">
                Issue
Verify
Trust
                <br />
                Verified.
                <br />
                Trusted.
              </h1>
              
              <div className="w-16 h-1 bg-accent drop-shadow-md" />
              
              <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed max-w-xl drop-shadow-md">
                <span className="font-semibold">Peer-to-peer certificate issuance and verification.</span>
                <br /><br />
                Anyone can issue, verify, and revoke certificates. People keep their own, choose what to reveal, and your app integrates it with a few lines of code.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-base group rounded-full">
                Read Documentation
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="text-base rounded-full bg-transparent border-white/40 hover:bg-white/10 hover:border-white/60 text-white">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </div>
          </div>

          {/* Right column - Code */}
          <div className="lg:pl-8 pt-8 md:pt-12">
            <div className="bg-foreground rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
              {/* Terminal window controls */}
              <div className="bg-foreground/90 px-4 py-3 flex items-center gap-2 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              
              {/* Terminal content */}
              <div className="p-6">
                <SyntaxHighlighter language="typescript" style={vscDarkPlus} customStyle={{
                background: 'transparent',
                padding: 0,
                margin: 0,
                fontSize: '0.875rem'
              }} codeTagProps={{
                style: {
                  fontFamily: 'monospace'
                }
              }}>
                  {`await peercert.issue({
  certificateType: Utils.toBase64(
    Utils.toArray('employment', 'utf8')
  ),
  subjectIdentityKey: '03abc123...',
  fields: {
    role: 'Metanet Engineer',
    company: 'Project Babbage'
  }
})`}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <ChevronDown className="w-8 h-8 text-white/60 drop-shadow-lg" />
      </div>
    </section>;
};
export default Hero;