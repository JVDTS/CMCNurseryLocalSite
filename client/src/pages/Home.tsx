import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import MissionSection from "@/components/MissionSection";
import NurseriesSection from "@/components/NurseriesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import GallerySection from "@/components/GallerySection";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import GovernmentFundingPopup from "@/components/GovernmentFundingPopup";

export default function Home() {
  const version = "v1.0.0"; // Update this manually or automate with a script
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full">
      <NavBar />
      <HeroSection />
      <AboutSection />
      <MissionSection />
      <NurseriesSection />
      <TestimonialsSection />
      <GallerySection />
      <FAQSection />
      <ContactSection />
      {/* Government Funding Popup */}
      <GovernmentFundingPopup />
      {/* Site version for testers */}
      <div className="w-full text-center py-2 text-xs text-gray-500 bg-gray-100">Site Version: {version}</div>
      {/* Removed 'View Contact Submissions' button as requested */}
      <Footer />
    </div>
  );
}
