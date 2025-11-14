import { Button } from "@/components/ui/button";
import { MessageSquare, Zap, Shield, Headphones } from "lucide-react";
const IntegrationCTA = () => {
  return <section className="py-24 px-6 bg-gradient-to-br from-accent/20 via-background to-accent/10">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-accent/20 rounded-full">
              <span className="text-sm font-semibold text-accent-foreground">
                Professional Support
              </span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
              Need help integrating certification workflows?
            </h2>
            <p className="text-lg text-muted-foreground font-light leading-relaxed">
              Our team of experts can help you seamlessly integrate PeerCert into your application. 
              From initial setup to advanced customization, we'll guide you every step of the way.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Fast Integration</h3>
                  <p className="text-sm text-muted-foreground font-light">
                    Get up and running quickly
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Best Practices</h3>
                  <p className="text-sm text-muted-foreground font-light">
                    Security-first approach
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Ongoing Support</h3>
                  <p className="text-sm text-muted-foreground font-light">
                    We're here when you need us
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Custom Solutions</h3>
                  <p className="text-sm text-muted-foreground font-light">
                    Tailored to your needs
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Button size="lg" className="text-base group" onClick={() => window.location.href = 'mailto:support@projectbabbage.com?subject=Integration%20Help%20Request'}>
                <MessageSquare className="w-5 h-5 mr-2" />
                Contact Us for Integration Help
              </Button>
              <p className="text-sm text-muted-foreground font-light mt-3">
                We typically respond within 24 hours
              </p>
            </div>
          </div>

          {/* Right: Visual Card */}
          <div className="relative">
            <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
              <div className="space-y-6">
                <div className="flex items-start gap-4 pb-6 border-b border-border">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">What you'll get:</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground font-light">
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-0.5">✓</span>
                        <span>Dedicated integration consultation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-0.5">✓</span>
                        <span>Code review and optimization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-0.5">✓</span>
                        <span>Security audit and recommendations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-0.5">✓</span>
                        <span>Custom feature development</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-0.5">✓</span>
                        <span>Priority email and chat support</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative element */}
            <div className="absolute -z-10 top-8 right-8 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>;
};
export default IntegrationCTA;