import Header from "@/components/layout/Header";
import MatrixRain from "@/components/background/MatrixRain";
import HeroSection from "@/components/hero/HeroSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <MatrixRain />
      <Header />
      <div className="relative z-10">
        <HeroSection />
      </div>
    </main>
  );
}
