import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BadgeCheck, Award, Building, GraduationCap, UserCheck } from "lucide-react";

const useCases = [
  {
    icon: Users,
    title: "Trust Networks",
    description: "Build decentralized reputation systems where peers vouch for each other's reliability, skills, and transaction history.",
    example: "Peer-to-peer marketplaces, freelance platforms"
  },
  {
    icon: UserCheck,
    title: "Identity Verification",
    description: "Enable peers to verify each other's identity attributes without centralized identity providers.",
    example: "KYC verification, age verification, address confirmation"
  },
  {
    icon: Award,
    title: "Skill Endorsements",
    description: "Create professional endorsements and skill validations without relying on centralized platforms.",
    example: "Technical certifications, project collaborations"
  },
  {
    icon: GraduationCap,
    title: "Educational Credentials",
    description: "Issue and verify educational achievements, course completions, and academic credentials peer-to-peer.",
    example: "Bootcamp certificates, workshop attendance, mentorship programs"
  },
  {
    icon: Building,
    title: "Employment History",
    description: "Former colleagues and managers can issue employment certificates that are cryptographically verifiable.",
    example: "Work history, role verification, project participation"
  },
  {
    icon: BadgeCheck,
    title: "Community Membership",
    description: "Prove membership and participation in communities, organizations, or events without central databases.",
    example: "Event attendance, community contributions, membership levels"
  }
];

const UseCases = () => {
  return (
    <section className="py-24 px-6 relative bg-gradient-to-b from-background via-card/20 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Built for Real-World Applications
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From professional networks to educational systems—PeerCert enables trust at scale
          </p>
        </div>

        {/* Use cases grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <Card 
              key={index}
              className="bg-card/80 backdrop-blur border-border hover:border-accent/50 transition-all duration-300 group"
            >
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-accent flex items-center justify-center mb-4 group-hover:shadow-glow-accent transition-all">
                  <useCase.icon className="w-7 h-7 text-accent" />
                </div>
                <CardTitle className="text-2xl mb-2">{useCase.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {useCase.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="inline-flex items-center text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
                  {useCase.example}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
