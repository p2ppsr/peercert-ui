import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 w-full z-50">
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-sm drop-shadow-md" />
          <span className="font-serif text-2xl font-bold text-white drop-shadow-lg">PeerCert</span>
        </div>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-10">
          <a href="#features" className="text-sm font-medium text-white/80 hover:text-white transition-colors drop-shadow-md">
            Features
          </a>
          <a href="#use-cases" className="text-sm font-medium text-white/80 hover:text-white transition-colors drop-shadow-md">
            Use Cases
          </a>
          <a href="#docs" className="text-sm font-medium text-white/80 hover:text-white transition-colors drop-shadow-md">
            Documentation
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Github className="w-5 h-5" />
          </Button>
          <Button size="sm" className="hidden sm:inline-flex">
            Get Started
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
