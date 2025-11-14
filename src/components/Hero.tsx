import { Button } from "@/components/ui/button";
import { Github, Book, Terminal } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-6xl mx-auto text-center animate-fade-in">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-8">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Built on BSV blockchain</span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
          Peer-to-Peer Certificate
          <br />
          Issuance Made Simple
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
          Issue, receive, and verify certificates directly between peers. No servers, no intermediaries—just pure cryptographic trust on the BSV blockchain.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button size="lg" className="text-lg px-8 shadow-glow-primary hover:shadow-glow-primary/70 transition-all">
            <Book className="w-5 h-5 mr-2" />
            Read the Docs
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 border-border hover:border-primary transition-all">
            <Github className="w-5 h-5 mr-2" />
            View on GitHub
          </Button>
        </div>

        {/* Installation command */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-6 text-left shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-mono">Terminal</span>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/50" />
                <div className="w-3 h-3 rounded-full bg-accent/50" />
                <div className="w-3 h-3 rounded-full bg-primary/50" />
              </div>
            </div>
            <code className="text-primary font-mono text-lg block">
              npm install peercert
            </code>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
