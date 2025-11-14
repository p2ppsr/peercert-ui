import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CodeExample from "@/components/CodeExample";
import UseCases from "@/components/UseCases";
import Benefits from "@/components/Benefits";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <CodeExample />
      <UseCases />
      <Benefits />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
