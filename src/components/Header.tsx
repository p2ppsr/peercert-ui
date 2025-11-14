import { Button } from "@/components/ui/button";
import { Github, Book } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <span className="text-xl font-bold text-background">P</span>
          </div>
          <span className="text-xl font-bold">PeerCert</span>
        </div>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#use-cases" className="text-muted-foreground hover:text-foreground transition-colors">
            Use Cases
          </a>
          <a href="#docs" className="text-muted-foreground hover:text-foreground transition-colors">
            Docs
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Github className="w-5 h-5" />
          </Button>
          <Button size="sm" className="hidden sm:inline-flex">
            <Book className="w-4 h-4 mr-2" />
            Get Started
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
