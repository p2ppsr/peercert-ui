const useCases = [
  {
    category: "Professional",
    title: "Employment History",
    description: "Former colleagues issue verifiable employment certificates. No need to contact HR departments or wait for verification."
  },
  {
    category: "Education",
    title: "Credentials & Skills",
    description: "Bootcamp instructors, course mentors, and workshop leaders can issue certificates directly to participants."
  },
  {
    category: "Community",
    title: "Reputation Systems",
    description: "Build decentralized trust networks where peers vouch for reliability, skills, and transaction history."
  },
  {
    category: "Identity",
    title: "Peer Verification",
    description: "Enable identity attribute verification between peers without centralized providers or databases."
  }
];

const UseCases = () => {
  return (
    <section id="use-cases" className="py-32 px-6 bg-accent/5">
      <div className="max-w-7xl mx-auto">
        <div className="mb-24">
          <p className="text-sm uppercase tracking-wider text-muted-foreground mb-4 font-medium">
            Applications
          </p>
          <h2 className="font-serif text-5xl md:text-6xl font-bold max-w-3xl leading-tight">
            Built for real-world trust scenarios
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-x-16 gap-y-20">
          {useCases.map((useCase, index) => (
            <div key={index} className="space-y-4 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-px bg-blue-500 group-hover:w-16 transition-all" />
                <span className="text-sm font-medium text-blue-500 uppercase tracking-wider">
                  {useCase.category}
                </span>
              </div>

              <h3 className="font-serif text-3xl font-bold">
                {useCase.title}
              </h3>

              <p className="text-lg text-muted-foreground font-light leading-relaxed">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
