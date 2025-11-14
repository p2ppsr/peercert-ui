import { Button } from "@/components/ui/button";
import { Github, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

const Header = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header className={`fixed top-0 w-full z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-accent drop-shadow-md" />
          <span className="font-serif text-2xl font-bold text-white drop-shadow-lg">Issue Verify Trust</span>
        </div>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-10">
          <a href="#features" className="text-sm font-medium text-white/80 hover:text-white transition-all duration-300 drop-shadow-md hover:scale-110">
            Features
          </a>
          <a href="#docs" className="text-sm font-medium text-white/80 hover:text-white transition-all duration-300 drop-shadow-md hover:scale-110">
            Documentation
          </a>
          <a href="#use-cases" className="text-sm font-medium text-white/80 hover:text-white transition-all duration-300 drop-shadow-md hover:scale-110">
            Use Cases
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
