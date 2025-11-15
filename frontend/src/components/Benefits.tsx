const Benefits = () => {
  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-20 items-center">
          {/* Left - Philosophy */}
          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            <div className="space-y-4 sm:space-y-6">
              <p className="text-xs sm:text-sm uppercase tracking-wider text-muted-foreground font-medium">
                Philosophy
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                No middleman. No gatekeepers.
              </h2>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-2 sm:space-y-3 border-l-2 border-blue-500 pl-4 sm:pl-6">
                <h3 className="text-xl sm:text-2xl font-serif font-bold">Direct Exchange</h3>
                <p className="text-base sm:text-lg text-muted-foreground font-light leading-relaxed">
                  Traditional certificate systems require servers, databases, and administrators. PeerCert eliminates all of that. Certificates flow directly from issuer to recipient.
                </p>
              </div>

              <div className="space-y-2 sm:space-y-3 border-l-2 border-muted pl-4 sm:pl-6">
                <h3 className="text-xl sm:text-2xl font-serif font-bold">Your Data, Your Control</h3>
                <p className="text-base sm:text-lg text-muted-foreground font-light leading-relaxed">
                  No central database means no one else holds your credentials. Selective disclosure ensures you reveal only what's necessary, when it's necessary.
                </p>
              </div>

              <div className="space-y-2 sm:space-y-3 border-l-2 border-muted pl-4 sm:pl-6">
                <h3 className="text-xl sm:text-2xl font-serif font-bold">Built on Trust</h3>
                <p className="text-base sm:text-lg text-muted-foreground font-light leading-relaxed">
                  Cryptographic signatures on the BSV blockchain provide verifiable proof. No trust in servers, no reliance on uptime—just mathematics.
                </p>
              </div>
            </div>
          </div>

          {/* Right - Stats */}
          <div className="lg:pl-12">
            <div className="bg-foreground text-background p-8 sm:p-10 md:p-12 rounded-sm space-y-10 sm:space-y-12 md:space-y-16">
              <div className="space-y-2 sm:space-y-3 border-b border-background/20 pb-6 sm:pb-8">
                <div className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold">100%</div>
                <div className="text-base sm:text-lg font-light">Peer-to-Peer</div>
                <div className="text-xs sm:text-sm text-background/60 font-light">Zero central authority</div>
              </div>

              <div className="space-y-2 sm:space-y-3 border-b border-background/20 pb-6 sm:pb-8">
                <div className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold">0</div>
                <div className="text-base sm:text-lg font-light">Servers Required</div>
                <div className="text-xs sm:text-sm text-background/60 font-light">Fully decentralized</div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold">∞</div>
                <div className="text-base sm:text-lg font-light">Delivery Methods</div>
                <div className="text-xs sm:text-sm text-background/60 font-light">MessageBox, QR, NFC, files</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
