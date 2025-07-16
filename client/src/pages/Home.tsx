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
import { ReviewsSection, ReviewStats } from "@/components/ReviewsSection";
import { ReviewForm } from "@/components/ReviewForm";
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  // Fetch all reviews for stats
  const { data: allReviews = [] } = useQuery({
    queryKey: ['/api/reviews'],
  });

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full">
      <NavBar />
      <HeroSection />
      <AboutSection />
      <MissionSection />
      <NurseriesSection />
      <TestimonialsSection />
      <GallerySection />
      
      {/* Reviews Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Parents Say About Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real experiences from families who trust us with their children's early learning journey
            </p>
          </div>
          
          <ReviewStats reviews={allReviews} />
          <ReviewsSection maxReviews={6} />
          
          <div className="mt-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Share Your Experience
              </h3>
              <p className="text-gray-600">
                Help other families by sharing your nursery experience
              </p>
            </div>
            <ReviewForm />
          </div>
        </div>
      </section>
      
      <FAQSection />
      <ContactSection />
      
      {/* Government Funding Popup */}
      <GovernmentFundingPopup />
      <div className="fixed bottom-4 right-4 z-50">
        <a 
          href="/view-contact-submissions" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          View Contact Submissions
        </a>
      </div>
      <Footer />
    </div>
  );
}
