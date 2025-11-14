import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CodeExample = () => {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Intuitive API
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes with our clean, well-documented API
          </p>
        </div>

        {/* Code examples */}
        <Card className="bg-card/50 backdrop-blur border-border shadow-2xl">
          <CardContent className="p-0">
            <Tabs defaultValue="issue" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0">
                <TabsTrigger 
                  value="issue" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
                >
                  Issue Certificate
                </TabsTrigger>
                <TabsTrigger 
                  value="receive" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
                >
                  Receive & Verify
                </TabsTrigger>
                <TabsTrigger 
                  value="reveal" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
                >
                  Selective Disclosure
                </TabsTrigger>
              </TabsList>

              <TabsContent value="issue" className="p-6">
                <pre className="text-sm overflow-x-auto">
                  <code className="text-foreground/90 font-mono">
{`import { PeerCert } from 'peercert'
import { Utils } from '@bsv/sdk'

const peercert = new PeerCert()

// Issue and automatically send via MessageBox
await peercert.issue({
  certificateType: Utils.toBase64(
    Utils.toArray('employment', 'utf8')
  ),
  subjectIdentityKey: '03abc123...', // Peer's identity key
  fields: {
    role: 'Senior Engineer',
    company: 'ACME Corp',
    start_date: '2024-01-15'
  },
  autoSend: true // Automatically sends via MessageBox!
})

console.log('Certificate issued and sent! ✅')`}
                  </code>
                </pre>
              </TabsContent>

              <TabsContent value="receive" className="p-6">
                <pre className="text-sm overflow-x-auto">
                  <code className="text-foreground/90 font-mono">
{`// Listen for certificates in real-time
await peercert.listenForCertificates(
  async (serializedCert, messageId, sender) => {
    console.log(\`New certificate from \${sender}!\`)
    
    // Receive and verify
    const result = await peercert.receive(serializedCert)
    
    if (result.success) {
      console.log('Certificate verified! ✅')
      console.log('Certifier:', result.walletCertificate?.certifier)
      
      // Acknowledge to remove from MessageBox
      await peercert.acknowledgeCertificate(messageId)
    }
  }
)`}
                  </code>
                </pre>
              </TabsContent>

              <TabsContent value="reveal" className="p-6">
                <pre className="text-sm overflow-x-auto">
                  <code className="text-foreground/90 font-mono">
{`// Create verifiable certificate with selective disclosure
const verifiable = await peercert.createVerifiableCertificate({
  certificate: myCertificate,
  verifierPublicKey: '03verifier...',
  fieldsToReveal: ['role', 'company'] // Only these visible
})

// Verify shared certificate with automatic revocation check
const result = await peercert.verifyVerifiableCertificate(
  verifiable,
  { checkRevocation: true }
)

if (result.verified && !result.revocationStatus?.isRevoked) {
  console.log('Valid certificate! ✅')
  console.log('Revealed fields:', result.fields)
}`}
                  </code>
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CodeExample;
