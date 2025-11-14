const examples = [
  {
    title: "Issue a Certificate",
    description: "Create and send certificates in a single call",
    code: `import { PeerCert } from 'peercert'

const peercert = new PeerCert()

await peercert.issue({
  certificateType: 'employment',
  subjectIdentityKey: '03abc123...',
  fields: {
    role: 'Senior Engineer',
    company: 'ACME Corp',
    start_date: '2024-01-15'
  },
  autoSend: true
})`
  },
  {
    title: "Receive & Verify",
    description: "Real-time certificate verification",
    code: `await peercert.listenForCertificates(
  async (cert, messageId, sender) => {
    const result = await peercert.receive(cert)
    
    if (result.success) {
      console.log('Verified! ✓')
      await peercert.acknowledgeCertificate(
        messageId
      )
    }
  }
)`
  },
  {
    title: "Selective Disclosure",
    description: "Share only what's necessary",
    code: `const verifiable = 
  await peercert.createVerifiableCertificate({
    certificate: myCert,
    verifierPublicKey: '03verifier...',
    fieldsToReveal: ['role', 'company']
  })

const result = 
  await peercert.verifyVerifiableCertificate(
    verifiable,
    { checkRevocation: true }
  )`
  }
];

const CodeExample = () => {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-24">
          <p className="text-sm uppercase tracking-wider text-muted-foreground mb-4 font-medium">
            Developer Experience
          </p>
          <h2 className="font-serif text-5xl md:text-6xl font-bold max-w-3xl leading-tight mb-6">
            Simple, intuitive API
          </h2>
          <p className="text-xl text-muted-foreground font-light max-w-2xl">
            Clean methods, clear documentation, and TypeScript support throughout.
          </p>
        </div>

        <div className="space-y-16">
          {examples.map((example, index) => (
            <div 
              key={index}
              className="grid lg:grid-cols-12 gap-12 items-start"
            >
              <div className="lg:col-span-4 space-y-3">
                <h3 className="font-serif text-3xl font-bold">
                  {example.title}
                </h3>
                <p className="text-lg text-muted-foreground font-light">
                  {example.description}
                </p>
              </div>
              
              <div className="lg:col-span-8">
                <div className="bg-foreground text-background p-6 rounded-sm shadow-xl">
                  <pre className="text-sm font-mono overflow-x-auto">
                    <code className="text-background/90 leading-relaxed">
                      {example.code}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CodeExample;
