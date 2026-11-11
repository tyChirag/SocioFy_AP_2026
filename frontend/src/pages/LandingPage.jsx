import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/landing/Hero';
import Stats from '../components/landing/Stats';
import Features from '../components/landing/Features';
import Communication from '../components/landing/Communication';
import ProjectsPreview from '../components/landing/ProjectsPreview';
import CommunitiesPreview from '../components/landing/CommunitiesPreview';
import EventsPreview from '../components/landing/EventsPreview';
import CallToAction from '../components/landing/CallToAction';

/**
 * LandingPage Component
 * Primary public-facing landing page for SocioFy.
 * Assembles all landing sections in logical order with sticky navigation and footer.
 */
const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FC] text-[#17233B] antialiased selection:bg-[#5277D9] selection:text-white">
      {/* 1. Sticky Navigation Bar */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-grow">
        {/* 2. Hero Section */}
        <Hero />

        {/* 3. Platform Highlights / Stats */}
        <Stats />

        {/* 4. Core Features */}
        <Features />

        {/* 5. Communication & Messaging Preview */}
        <Communication />

        {/* 6. Sample Projects Preview */}
        <ProjectsPreview />

        {/* 7. Sample Communities Preview */}
        <CommunitiesPreview />

        {/* 8. Sample Events Preview */}
        <EventsPreview />

        {/* 9. Final Call to Action */}
        <CallToAction />
      </main>

      {/* 10. Platform Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
