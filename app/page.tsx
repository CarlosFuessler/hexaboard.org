import Header from "@/components/layout/Header";
import MatrixRain from "@/components/background/MatrixRain";
import HeroSection from "@/components/hero/HeroSection";
import KeypadSimulator from "@/components/simulator/KeypadSimulator";
import FeaturesSection from "@/components/features/FeaturesSection";
import ViewerSection from "@/components/viewer/ViewerSection";
import SpecsSection from "@/components/specs/SpecsSection";
import EcosystemSection from "@/components/ecosystem/EcosystemSection";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-emerald-500 selection:text-black">
      {/* Ambient background matrix digital rain effect */}
      <MatrixRain />

      {/* Sticky glass navigation header */}
      <Header />

      {/* Content wrapper with z-index above ambient background */}
      <div className="relative z-10">
        <HeroSection />
        <KeypadSimulator />
        <FeaturesSection />
        <ViewerSection />
        <SpecsSection />
        <EcosystemSection />
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
