import { GraduationCap } from 'lucide-react';

/**
 * Footer Component
 * Minimal, clean footer containing:
 * - SocioFy logo
 * - One-line platform description
 * - Features, About, Contact, Privacy Policy, Terms and Conditions links
 * - Copyright information
 */
const Footer = () => {
  const scrollToSection = (e, id) => {
    e.preventDefault();
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  };

  const navLinks = [
    { label: 'Features', id: 'features', action: (e) => scrollToSection(e, 'features') },
    { label: 'About', id: 'about', action: (e) => scrollToSection(e, 'about') },
    {
      label: 'Contact',
      id: 'contact',
      action: (e) => {
        e.preventDefault();
        alert('For inquiries, please contact campus support at support@sociofy.internal');
      },
    },
    {
      label: 'Privacy Policy',
      id: 'privacy',
      action: (e) => {
        e.preventDefault();
        alert('SocioFy Privacy Policy: Your university data is private, secure, and college-verified.');
      },
    },
    {
      label: 'Terms and Conditions',
      id: 'terms',
      action: (e) => {
        e.preventDefault();
        alert('SocioFy Terms and Conditions: Platform usage is restricted to authorized college students.');
      },
    },
  ];

  return (
    <footer id="about" className="bg-[#17233B] text-white pt-12 pb-10 border-t border-[#17233B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
          {/* Logo & One-line Description */}
          <div className="space-y-2 max-w-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#5277D9] flex items-center justify-center text-white shadow-sm">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Socio<span className="text-[#5277D9]">Fy</span>
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              The modern college social network connecting students, clubs, and project collaborations across campus.
            </p>
          </div>

          {/* Minimal Links */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-300">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={`#${link.id}`}
                onClick={link.action}
                className="hover:text-white transition-colors duration-150 cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2">
          <p>© {new Date().getFullYear()} SocioFy. All rights reserved.</p>
          <p>Built for university communities.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
