import { useState } from "react";
import { CheckCircle, ChevronRight, Book, Code, Rocket, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Footer from "@/components/Footer";

const docSections = [
  {
    id: "introduction",
    title: "Introduction",
    icon: Book,
    content: {
      title: "Welcome to PeerCert",
      description: "PeerCert is a peer-to-peer certificate issuance and management system that enables secure, decentralized credential verification.",
      subsections: [
        {
          title: "What is PeerCert?",
          content: "PeerCert allows individuals and organizations to issue, receive, and verify certificates without relying on centralized authorities. Built on blockchain technology, it ensures authenticity and tamper-proof records."
        },
        {
          title: "Key Features",
          content: "Decentralized verification, selective disclosure, instant issuance, and cryptographic security make PeerCert the ideal solution for modern credential management."
        }
      ]
    }
  },
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Rocket,
    content: {
      title: "Quick Start Guide",
      description: "Get up and running with PeerCert in minutes.",
      subsections: [
        {
          title: "Installation",
          content: "npm install peercert",
          code: true
        },
        {
          title: "Basic Setup",
          content: `import { PeerCert } from 'peercert';

const cert = new PeerCert({
  privateKey: 'your-private-key'
});`,
          code: true
        }
      ]
    }
  },
  {
    id: "api-reference",
    title: "API Reference",
    icon: Code,
    content: {
      title: "API Documentation",
      description: "Complete reference for all PeerCert methods and properties.",
      subsections: [
        {
          title: "issueCertificate()",
          content: `Issue a new certificate to a recipient.

Parameters:
- recipientPubkey: string - Public key of the recipient
- certData: object - Certificate data to embed

Returns: Promise<Certificate>`,
          code: true
        },
        {
          title: "verifyCertificate()",
          content: `Verify the authenticity of a certificate.

Parameters:
- certificate: Certificate - The certificate to verify

Returns: Promise<boolean>`,
          code: true
        }
      ]
    }
  },
  {
    id: "security",
    title: "Security",
    icon: Shield,
    content: {
      title: "Security Best Practices",
      description: "Learn how to keep your certificates and keys secure.",
      subsections: [
        {
          title: "Key Management",
          content: "Always store private keys securely. Never expose them in client-side code or version control. Use environment variables or secure key management systems."
        },
        {
          title: "Verification",
          content: "Always verify certificates before trusting the data they contain. PeerCert provides built-in verification methods that check cryptographic signatures and blockchain records."
        }
      ]
    }
  }
];

const Docs = () => {
  const [activeSection, setActiveSection] = useState("introduction");

  const currentSection = docSections.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-accent" />
            <span className="font-serif text-2xl font-bold">PeerCert</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[280px_1fr] gap-12">
          {/* Sidebar Navigation */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="space-y-1">
              <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
                Documentation
              </h2>
              {docSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      activeSection === section.id
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{section.title}</span>
                    {activeSection === section.id && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main Content */}
          <main className="min-w-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-8 pr-4">
                <div>
                  <h1 className="text-4xl font-serif font-bold mb-4">
                    {currentSection?.content.title}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {currentSection?.content.description}
                  </p>
                </div>

                {currentSection?.content.subsections.map((subsection, index) => (
                  <div key={index} className="space-y-3">
                    <h2 className="text-2xl font-semibold">{subsection.title}</h2>
                    {subsection.code ? (
                      <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                        <pre className="text-foreground">{subsection.content}</pre>
                      </div>
                    ) : (
                      <p className="text-muted-foreground leading-relaxed">
                        {subsection.content}
                      </p>
                    )}
                  </div>
                ))}

                <div className="pt-8 border-t border-border">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        const currentIndex = docSections.findIndex(s => s.id === activeSection);
                        if (currentIndex > 0) {
                          setActiveSection(docSections[currentIndex - 1].id);
                        }
                      }}
                      disabled={activeSection === docSections[0].id}
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => {
                        const currentIndex = docSections.findIndex(s => s.id === activeSection);
                        if (currentIndex < docSections.length - 1) {
                          setActiveSection(docSections[currentIndex + 1].id);
                        }
                      }}
                      disabled={activeSection === docSections[docSections.length - 1].id}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Docs;
