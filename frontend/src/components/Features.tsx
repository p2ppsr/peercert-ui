const features = [
  {
    number: "01",
    title: "Direct Issuance",
    description: "Certificate exchange happens directly between peers. No central authority, no server infrastructure, no middleman taking a cut or controlling your data."
  },
  {
    number: "02",
    title: "Cryptographic Verification",
    description: "Every certificate is cryptographically signed using Metanet identity keys. Tamper-proof, verifiable, and built on proven cryptographic primitives."
  },
  {
    number: "03",
    title: "Selective Disclosure",
    description: "Reveal only what matters. Create verifiable certificates that expose selected fields while keeping everything else encrypted and private."
  },
  {
    number: "04",
    title: "Built-in Revocation",
    description: "DID-based revocation system on the BSV blockchain. Issuers can revoke certificates, verifiers can check status automatically."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 sm:mb-16 md:mb-24">
          <p className="text-xs sm:text-sm uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4 font-medium">
            Features
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold max-w-3xl leading-tight">
            Everything you need to build trust networks
          </h2>
        </div>

        {/* Features list */}
        <div className="space-y-12 sm:space-y-16 md:space-y-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="grid md:grid-cols-12 gap-4 sm:gap-6 md:gap-8 items-start group"
            >
              <div className="md:col-span-2">
                <span className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-muted-foreground/20 group-hover:text-blue-500 transition-colors">
                  {feature.number}
                </span>
              </div>

              <div className="md:col-span-10 space-y-2 sm:space-y-3 md:space-y-4">
                <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold">
                  {feature.title}
                </h3>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl font-light">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
