import { Check } from "lucide-react";

const benefits = [
  {
    title: "Zero Infrastructure",
    description: "No servers to maintain, no databases to manage—just pure peer-to-peer certificate exchange."
  },
  {
    title: "Instant Delivery",
    description: "Certificates are delivered instantly via MessageBox or any channel you choose (QR, NFC, files)."
  },
  {
    title: "Privacy First",
    description: "Selective disclosure ensures only revealed fields are visible—everything else stays encrypted."
  },
  {
    title: "Revocation Built-in",
    description: "DID-based revocation on BSV blockchain provides reliable certificate invalidation when needed."
  },
  {
    title: "TypeScript Native",
    description: "Full TypeScript support with complete type safety and IntelliSense for better developer experience."
  },
  {
    title: "Battle-Tested Security",
    description: "Built on BSV SDK with proven cryptographic primitives and identity-based encryption."
  }
];

const Benefits = () => {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose PeerCert?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Traditional certificate systems require servers, databases, and complex infrastructure. PeerCert eliminates all of that with a simple, secure, peer-to-peer approach.
            </p>

            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-4 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1 group-hover:bg-primary/30 transition-colors">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Stats/Visual */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
            <div className="relative bg-card/80 backdrop-blur border border-border rounded-2xl p-8 shadow-2xl">
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="text-5xl font-bold text-primary">100%</div>
                  <div className="text-lg text-muted-foreground">Peer-to-Peer</div>
                  <div className="text-sm text-muted-foreground">No central authority required</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-5xl font-bold text-accent">0</div>
                  <div className="text-lg text-muted-foreground">Servers Needed</div>
                  <div className="text-sm text-muted-foreground">Completely decentralized architecture</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-5xl font-bold text-primary">∞</div>
                  <div className="text-lg text-muted-foreground">Verification Methods</div>
                  <div className="text-sm text-muted-foreground">MessageBox, QR, NFC, files, and more</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
