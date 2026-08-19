import Header from "@/components/layout/Header";
import MatrixRain from "@/components/background/MatrixRain";
import HeroSection from "@/components/hero/HeroSection";
import FeaturesSection from "@/components/features/FeaturesSection";
import ViewerSection from "@/components/viewer/ViewerSection";
import SpecsSection from "@/components/specs/SpecsSection";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-green-500 selection:text-black">
      {/* Matrix digital rain background visible from the very top */}
      <MatrixRain />

      {/* Sticky nav header */}
      <Header />

      {/* Main landing content */}
      <div className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <ViewerSection />
        <SpecsSection />
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
