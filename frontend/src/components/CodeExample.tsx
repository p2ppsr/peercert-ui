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

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeExample = () => {
  return (
    <section id="docs" className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 sm:mb-16 md:mb-24">
          <p className="text-xs sm:text-sm uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4 font-medium">
            Developer Experience
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold max-w-3xl leading-tight mb-4 sm:mb-6">
            Simple, intuitive API
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-light max-w-2xl">
            Clean methods, clear documentation, and TypeScript support throughout.
          </p>
        </div>

        <div className="space-y-12 sm:space-y-16">
          {examples.map((example, index) => (
            <div
              key={index}
              className="grid lg:grid-cols-12 gap-6 sm:gap-8 md:gap-12 items-start"
            >
              <div className="lg:col-span-4 space-y-2 sm:space-y-3">
                <h3 className="font-serif text-2xl sm:text-3xl font-bold">
                  {example.title}
                </h3>
                <p className="text-base sm:text-lg text-muted-foreground font-light">
                  {example.description}
                </p>
              </div>

              <div className="lg:col-span-8">
                <div className="bg-foreground rounded-xl sm:rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                  {/* Terminal window controls */}
                  <div className="bg-foreground/90 px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-1.5 sm:gap-2 border-b border-white/10">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500" />
                  </div>

                  {/* Code content */}
                  <div className="p-4 sm:p-6 overflow-x-auto">
                    <SyntaxHighlighter
                      language="typescript"
                      style={vscDarkPlus}
                      customStyle={{
                        background: 'transparent',
                        padding: 0,
                        margin: 0,
                        fontSize: 'clamp(0.65rem, 2vw, 0.875rem)'
                      }}
                      codeTagProps={{
                        style: {
                          fontFamily: 'monospace',
                          fontSize: 'clamp(0.65rem, 2vw, 0.875rem)'
                        }
                      }}
                    >
                      {example.code}
                    </SyntaxHighlighter>
                  </div>
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
