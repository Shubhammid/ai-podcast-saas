import { Header } from "@/components/Header";
import { FeaturesSection } from "@/components/home/features-section";
import { HeroSection } from "@/components/home/hero-section";

export default function Home() {
  return (
    <div className="min-h-screen">
       <Header />
       <HeroSection />
       <FeaturesSection />
    </div>
  );
}
