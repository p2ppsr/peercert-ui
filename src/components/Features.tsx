import { MessageSquare, Shield, Zap, Lock, CheckCircle, Network } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: MessageSquare,
    title: "Direct Issuance",
    description: "Issue certificates directly from one peer to another without any central authority or server infrastructure."
  },
  {
    icon: Network,
    title: "MessageBox Integration",
    description: "Built-in MessageBox support for seamless certificate delivery with automatic sending and real-time listening."
  },
  {
    icon: Lock,
    title: "Selective Disclosure",
    description: "Create verifiable certificates revealing only selected fields while keeping other information private."
  },
  {
    icon: Shield,
    title: "Cryptographic Verification",
    description: "Full signature verification using BSV identity keys ensures authenticity and prevents tampering."
  },
  {
    icon: CheckCircle,
    title: "Certificate Revocation",
    description: "DID-based revocation system lets issuers revoke certificates with automatic checking capabilities."
  },
  {
    icon: Zap,
    title: "No Server Required",
    description: "Completely peer-to-peer architecture eliminates the need for centralized certificate authority servers."
  }
];

const Features = () => {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful Features for Modern Trust Networks
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to build decentralized certificate systems without the complexity
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 group-hover:shadow-glow-primary transition-all">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
