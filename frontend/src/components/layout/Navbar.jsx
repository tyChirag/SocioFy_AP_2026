import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, GraduationCap } from 'lucide-react';
import PrimaryButton from '../common/PrimaryButton';

/**
 * Navbar Component
 * Sticky, responsive navigation bar with smooth scrolling links,
 * mobile drawer menu, and auth placeholders.
 */
const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Monitor scroll state to enhance shadow/blur on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll helper
  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (targetId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80; // Account for fixed navbar height
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const navLinks = [
    { label: 'Home', id: 'top' },
    { label: 'Features', id: 'features' },
    { label: 'Communities', id: 'communities' },
    { label: 'Projects', id: 'projects' },
    { label: 'Events', id: 'events' },
    { label: 'About', id: 'communication' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? 'bg-[#F8F9FC]/95 backdrop-blur-md border-b border-[#E5E7EB] shadow-xs'
          : 'bg-[#F8F9FC] border-b border-[#E5E7EB]/70'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Left: Brand Logo & Name */}
          <a
            href="#top"
            onClick={(e) => handleNavClick(e, 'top')}
            className="flex items-center gap-2.5 group cursor-pointer"
            aria-label="SocioFy Home"
          >
            <div className="w-10 h-10 rounded-xl bg-[#17233B] flex items-center justify-center text-white shadow-xs group-hover:bg-[#5277D9] transition-colors duration-200">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-[#17233B]">
                Socio<span className="text-[#5277D9]">Fy</span>
              </span>
              <span className="text-[10px] font-semibold text-[#667085] tracking-wider uppercase -mt-1 hidden sm:block">
                Campus Network
              </span>
            </div>
          </a>

          {/* Middle: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => handleNavClick(e, link.id)}
                className="px-3.5 py-2 text-sm font-medium text-[#17233B] hover:text-[#5277D9] hover:bg-[#E8EDF7]/60 rounded-lg transition-all duration-150"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right: Auth Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => alert('Log In modal / route is a placeholder for future authentication.')}
              className="px-4 py-2 text-sm font-medium text-[#17233B] hover:text-[#5277D9] transition-colors cursor-pointer"
            >
              Log In
            </button>
            <PrimaryButton
              size="sm"
              variant="primary"
              onClick={(e) => handleNavClick(e, 'cta')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Get Started
            </PrimaryButton>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#17233B] hover:bg-[#E8EDF7] transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E5E7EB] bg-white px-4 pt-3 pb-6 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => handleNavClick(e, link.id)}
                className="px-4 py-2.5 text-base font-medium text-[#17233B] hover:bg-[#E8EDF7] hover:text-[#5277D9] rounded-xl transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-[#E5E7EB] flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                alert('Log In is a placeholder for future authentication.');
              }}
              className="w-full py-2.5 text-center text-sm font-medium text-[#17233B] border border-[#E5E7EB] rounded-xl hover:bg-[#F8F9FC] transition-colors"
            >
              Log In
            </button>
            <PrimaryButton
              variant="primary"
              size="md"
              className="w-full"
              onClick={(e) => handleNavClick(e, 'cta')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Get Started
            </PrimaryButton>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
