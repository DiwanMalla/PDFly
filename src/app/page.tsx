import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import ToolSelector from "@/components/ToolSelector";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";
import FaqSection from "@/components/FaqSection";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <FeaturesSection />

      {/* Tools Showcase Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful PDF Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional-grade PDF processing tools that work seamlessly in
              your browser. No software installation required.
            </p>
          </div>
          <ToolSelector />
        </div>
      </section>

      <PricingSection />
      <FaqSection />
      <Footer />
    </div>
  );
}
