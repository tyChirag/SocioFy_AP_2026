import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';

/**
 * LandingPage Component
 * Clean, simplified, and modern landing page for SocioFy.
 * Consists strictly of 4 sections:
 * 1. Navbar
 * 2. Hero
 * 3. Features (Combined Connect, Collaborate, Communicate)
 * 4. Footer
 */
const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FC] text-[#17233B] antialiased selection:bg-[#5277D9] selection:text-white">
      {/* 1. Navbar */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-grow">
        {/* 2. Hero Section */}
        <Hero />

        {/* 3. Features Section */}
        <Features />
      </main>

      {/* 4. Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
