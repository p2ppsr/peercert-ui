import { useState, useEffect, useRef } from "react";
import { CheckCircle, ChevronRight, Book, Code, Rocket, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import IntegrationCTA from "@/components/IntegrationCTA";
import Footer from "@/components/Footer";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const docSections = [
  {
    id: "introduction",
    title: "Introduction",
    icon: Book,
    content: {
      title: "Welcome to PeerCert",
      description:
        "PeerCert is a peer-to-peer certificate issuance and management library for the BSV blockchain. It lets peers issue, receive, reveal, and revoke cryptographically signed certificates without a central server.",
      subsections: [
        {
          title: "What is PeerCert?",
          content:
            "PeerCert wraps @bsv/sdk to provide a high-level API for issuing certificates between identity keys. Certificates are signed by the issuer, optionally delivered via MessageBox, and stored in the recipient's wallet as WalletCertificates."
        },
        {
          title: "Core capabilities",
          content:
            "Issue peer-to-peer certificates, deliver them via MessageBox or custom channels, receive and store them in a wallet, selectively reveal fields, create verifiable certificates, and revoke or check revocation via DID-based tokens on BSV."
        },
        {
          title: "When to use PeerCert",
          content:
            "Use PeerCert for decentralized attestations: employment proofs, skill endorsements, KYC attestations, trust networks, or any scenario where one identity certifies facts about another without relying on a centralized issuer."
        }
      ]
    }
  },
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Rocket,
    content: {
      title: "Quick Start",
      description: "Install the library and create your first PeerCert instance.",
      subsections: [
        {
          title: "Installation",
          content: "npm install peercert",
          code: true
        },
        {
          title: "Create a PeerCert instance",
          content:
            "import { Utils, WalletClient } from '@bsv/sdk';\nimport { PeerCert } from 'peercert';\n\n// Default wallet\nconst peercert = new PeerCert();\n\n// With a custom WalletClient and options\nconst wallet = new WalletClient();\nconst peercertWithOptions = new PeerCert(wallet, {\n  originator: 'myapp.com',\n  networkPreset: 'mainnet',\n});",
          code: true
        },
        {
          title: "Auto-send via MessageBox",
          content:
            "import { Utils } from '@bsv/sdk';\nimport { PeerCert } from 'peercert';\n\nconst peercert = new PeerCert();\n\nawait peercert.issue({\n  certificateType: Utils.toBase64(Utils.toArray('employment', 'utf8')),\n  subjectIdentityKey: '03abc123...', // recipient identity key\n  fields: {\n    role: 'Engineer',\n    company: 'ACME Corp',\n    start_date: '2024-01-15',\n  },\n  autoSend: true, // automatically sends via MessageBox\n});",
          code: true
        }
      ]
    }
  },
  {
    id: "issuing-receiving",
    title: "Issuing & Receiving",
    icon: Code,
    content: {
      title: "Issuing, Sending, and Receiving Certificates",
      description:
        "Issue certificates to peers, deliver them via MessageBox or custom channels, and receive/store them in a wallet.",
      subsections: [
        {
          title: "Issue without auto-send (manual delivery)",
          content:
            "import { Utils } from '@bsv/sdk';\nimport { PeerCert } from 'peercert';\n\nconst peercert = new PeerCert();\n\nconst masterCert = await peercert.issue({\n  certificateType: Utils.toBase64(Utils.toArray('employment', 'utf8')),\n  subjectIdentityKey: '03abc123...',\n  fields: {\n    role: 'Engineer',\n    company: 'ACME Corp',\n  },\n  autoSend: false,\n});\n\n// Send via MessageBox manually\nawait peercert.send({\n  recipient: '03abc123...',\n  serializedCertificate: JSON.stringify(masterCert),\n});\n\n// Or send via QR / NFC / file using the serialized JSON\nconst serialized = JSON.stringify(masterCert);",
          code: true
        },
        {
          title: "Receive from MessageBox",
          content:
            "const incoming = await peercert.listIncomingCertificates();\n\nfor (const cert of incoming) {\n  console.log('Certificate from', cert.sender);\n\n  const result = await peercert.receive(cert.serializedCertificate);\n\n  if (result.success) {\n    console.log('Certificate accepted!');\n    await peercert.acknowledgeCertificate(cert.messageId);\n  } else {\n    console.error('Receive failed:', result.error);\n  }\n}",
          code: true
        },
        {
          title: "Receive from QR / file / other channels",
          content:
            "// If you already have the certificate JSON string\nawait peercert.receive(serializedCertificateString);\n\n// Or from a parsed MasterCertificate object\nawait peercert.receive(masterCertificateObject);",
          code: true
        }
      ]
    }
  },
  {
    id: "selective-disclosure",
    title: "Selective Disclosure",
    icon: Shield,
    content: {
      title: "Selective Disclosure & Verification",
      description:
        "Create verifiable certificates that reveal only selected fields, and verify them with optional revocation checking.",
      subsections: [
        {
          title: "Create a verifiable certificate",
          content:
            "// List certificates from your wallet (with keyring)\nconst certs = await wallet.listCertificates({\n  certifiersRequired: ['all'],\n  limit: 1,\n});\n\nconst verifiableCert = await peercert.createVerifiableCertificate({\n  certificate: certs.certificates[0],\n  verifierPublicKey: '03verifier...',\n  fieldsToReveal: ['role', 'company'],\n});\n\n// Send to the verifier via MessageBox\nawait peercert.send({\n  recipient: '03verifier...',\n  serializedCertificate: JSON.stringify(verifiableCert),\n  issuance: false, // inspection only\n});",
          code: true
        },
        {
          title: "Verify a shared certificate",
          content:
            "const incoming = await peercert.listIncomingCertificates();\n\nfor (const cert of incoming) {\n  const result = await peercert.verifyVerifiableCertificate(\n    cert.serializedCertificate,\n    { checkRevocation: true },\n  );\n\n  if (result.verified) {\n    if (result.revocationStatus?.isRevoked) {\n      console.log('⚠️ Certificate has been revoked');\n    } else {\n      console.log('✅ Certificate is valid');\n      console.log('Revealed fields:', result.fields);\n    }\n  } else {\n    console.error('Verification failed:', result.error);\n  }\n}",
          code: true
        }
      ]
    }
  },
  {
    id: "revocation-reveal",
    title: "Revocation & Public Reveal",
    icon: Shield,
    content: {
      title: "Revocation & Public Reveal",
      description:
        "Use DID-based revocation tokens to revoke certificates, check their status, and publicly reveal selected fields on the overlay network.",
      subsections: [
        {
          title: "Publicly reveal certificate fields",
          content:
            "// Get a WalletCertificate from your wallet\nconst certs = await wallet.listCertificates({\n  certifiers: [issuerPublicKey],\n  types: [certificateTypeBase64],\n});\n\nconst broadcastResult = await peercert.reveal({\n  certificate: certs.certificates[0],\n  fieldsToReveal: ['role', 'company'],\n});\n\nconsole.log('Revealed on overlay, txid:', broadcastResult.txid);",
          code: true
        },
        {
          title: "Revoke a certificate you issued",
          content:
            "const issued = await wallet.listCertificates({ limit: 1 });\n\nconst revokeResult = await peercert.revoke(issued.certificates[0]);\n\nif (revokeResult.success) {\n  console.log('Certificate revoked, txid:', revokeResult.txid);\n} else {\n  console.error('Revocation failed:', revokeResult.error);\n}",
          code: true
        },
        {
          title: "Check revocation status",
          content:
            "const status = await peercert.checkRevocation(walletCertificate);\n\nif (status.isRevoked) {\n  console.log('⚠️ Certificate has been revoked');\n  console.log(status.message);\n} else {\n  console.log('✅ Certificate is still valid');\n}",
          code: true
        }
      ]
    }
  },
  {
    id: "compact-format-ui",
    title: "Compact Format & UI",
    icon: Code,
    content: {
      title: "Compact Serialization & PeerCert UI",
      description:
        "Use the compact binary certificate format and the PeerCert UI to create, share, and receive certificates in real-world apps.",
      subsections: [
        {
          title: "Compact certificate format",
          content:
            "import { PeerCert } from 'peercert';\n\n// masterCert is a MasterCertificate from peercert.issue()\nconst compact = PeerCert.encodeCertificate(masterCert, 'base64');\n// Example: 'AQdteXBlTm...' (~50–70% smaller than JSON)\n\n// Later, decode back to certificate data\nconst certData = PeerCert.decodeCertificate(compact, 'base64');\n\n// Receive the decoded certificate\nawait peercert.receive(JSON.stringify(certData));",
          code: true
        },
        {
          title: "Using PeerCert UI",
          content:
            "The PeerCert UI (peercert-ui) is a React app built on this library. It lets you create certificates, choose delivery methods (auto-send via MessageBox or manual compact base64), paste compact data to receive certificates, and manage your stored certificates (reveal, revoke, relinquish, and check revocation)."
        },
        {
          title: "End-to-end flow with the UI",
          content:
            "1) Issuer uses PeerCert UI to create a certificate and either auto-send via MessageBox or copy compact data. 2) Recipient uses the Receive Certificates view to accept from MessageBox or paste compact data. 3) The certificate is stored in the wallet. 4) Recipient can later reveal selected fields, create verifiable certificates, or check revocation using the underlying peercert API."
        }
      ]
    }
  }
];

const Docs = () => {
  const [activeSection, setActiveSection] = useState("introduction");
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollAreaRef.current) return;
    const viewport = scrollAreaRef.current.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement | null;
    if (viewport) {
      viewport.scrollTo({ top: 0 });
    }
  }, [activeSection]);

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
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${activeSection === section.id
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
            <ScrollArea ref={scrollAreaRef} className="h-[calc(100vh-200px)]">
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
                      <div className="bg-foreground rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                        {/* Terminal window controls */}
                        <div className="bg-foreground/90 px-4 py-3 flex items-center gap-2 border-b border-white/10">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>

                        {/* Code content */}
                        <div className="p-6">
                          <SyntaxHighlighter
                            language="typescript"
                            style={vscDarkPlus}
                            customStyle={{
                              background: 'transparent',
                              padding: 0,
                              margin: 0,
                              fontSize: '0.875rem'
                            }}
                            codeTagProps={{
                              style: {
                                fontFamily: 'monospace'
                              }
                            }}
                          >
                            {subsection.content}
                          </SyntaxHighlighter>
                        </div>
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
    </div>
  );
};

export default Docs;
