import { Github, Twitter, Mail } from "lucide-react";
const Footer = () => {
  return <footer className="border-t border-border">
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="grid md:grid-cols-12 gap-12 mb-16">
        {/* Brand */}
        <div className="md:col-span-5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-sm" />
            <span className="font-serif text-2xl font-bold">PeerCert</span>
          </div>
          <p className="text-muted-foreground font-light leading-relaxed max-w-md">
            Peer-to-peer certificate issuance and management.
          </p>
        </div>

        {/* Links */}
        <div className="md:col-span-7 grid grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider">Product</h3>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light">
                  Features
                </a>
              </li>
              <li>
                <a href="#use-cases" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light">
                  Use Cases
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider">Community</h3>
            <ul className="space-y-3">
              <li>
                <a href="https://join.bsv.chat" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light">
                  BSV Chat
                </a>
              </li>
              <li>
                <a href="https://metanetacademy.com" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light">
                  Metanet Academy
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-muted-foreground font-light">
          © 2025 Peer-to-peer Privacy Systems Research, LLC
        </p>
        <div className="flex items-center gap-4">
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            <Github className="w-5 h-5" />
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            <Mail className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  </footer>;
};
export default Footer;