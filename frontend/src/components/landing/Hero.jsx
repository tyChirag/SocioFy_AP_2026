import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Users,
  Compass,
  FolderGit2,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Share2,
  Heart,
} from 'lucide-react';
import PrimaryButton from '../common/PrimaryButton';

/**
 * Hero Section
 * Main headline, value proposition, primary CTAs, and a realistic
 * interactive mock preview of the SocioFy platform interface.
 */
const Hero = () => {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="top" className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 lg:pt-18 lg:pb-28">
      {/* Subtle decorative background gradient circles */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#E8EDF7]/70 via-[#F8F9FC]/40 to-transparent blur-3xl -z-10"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Text & Call to Actions (7 cols on lg) */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-6 flex flex-col text-left"
          >
            {/* College Exclusive Badge */}
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-[#E8EDF7] border border-[#5277D9]/20 text-[#5277D9] text-xs font-semibold tracking-wide uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Exclusively for College Students</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-[#17233B] tracking-tight leading-[1.12]">
              Your Campus.{' '}
              <span className="text-[#5277D9] block sm:inline">Your People.</span>{' '}
              <span className="block text-[#17233B]">Your Community.</span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-base sm:text-lg text-[#667085] leading-relaxed max-w-xl">
              Discover students who share your interests, build meaningful connections, collaborate on exciting projects, and stay updated with everything happening around your campus.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <PrimaryButton
                size="lg"
                variant="primary"
                onClick={() => scrollToSection('cta')}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Join Your Campus
              </PrimaryButton>
              <PrimaryButton
                size="lg"
                variant="secondary"
                onClick={() => scrollToSection('features')}
              >
                Explore Features
              </PrimaryButton>
            </div>

            {/* Trust / Verified Student Badges */}
            <div className="mt-10 pt-6 border-t border-[#E5E7EB] flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[#667085]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified .edu student IDs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero spam, 100% college-focused</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Free for all enrolled students</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Realistic Product Preview Window (6 cols on lg) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="lg:col-span-6 w-full"
          >
            {/* Outer Mockup Container */}
            <div className="relative mx-auto max-w-lg lg:max-w-none rounded-2xl bg-white border border-[#E5E7EB] shadow-xl overflow-hidden">
              {/* App Window Header Bar */}
              <div className="bg-[#17233B] px-4 py-3 flex items-center justify-between text-white border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80"></div>
                  <span className="ml-2 text-xs font-medium text-gray-300">
                    SocioFy — University Portal (Demo Preview)
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white font-mono">
                  v2.6 Live
                </span>
              </div>

              {/* Subheader / Tabs bar */}
              <div className="bg-[#F8F9FC] border-b border-[#E5E7EB] px-4 py-2 flex items-center justify-between text-xs text-[#667085]">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-[#5277D9] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> Feed
                  </span>
                  <span className="hover:text-[#17233B] flex items-center gap-1 hidden sm:flex">
                    <Compass className="w-3.5 h-3.5" /> Hubs
                  </span>
                  <span className="hover:text-[#17233B] flex items-center gap-1 hidden sm:flex">
                    <FolderGit2 className="w-3.5 h-3.5" /> Projects
                  </span>
                </div>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                  Verified Student
                </span>
              </div>

              {/* Feed Content Area */}
              <div className="p-4 sm:p-5 space-y-4 bg-[#F8F9FC]/50 max-h-[480px] overflow-y-auto">
                {/* 1. Student Feed Post */}
                <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-2xs">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#5277D9]/15 text-[#5277D9] font-bold flex items-center justify-center text-sm border border-[#5277D9]/30">
                        SP
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-[#17233B]">Sneha Patel</h4>
                          <span className="text-[11px] px-1.5 py-0.2 rounded bg-[#E8EDF7] text-[#5277D9] font-medium">
                            CS '26
                          </span>
                        </div>
                        <p className="text-[11px] text-[#667085]">Computer Science Dept • 20m ago</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-xs px-2.5 py-1 rounded-lg bg-[#E8EDF7] text-[#5277D9] font-medium hover:bg-[#5277D9] hover:text-white transition-colors"
                    >
                      Connect
                    </button>
                  </div>

                  <p className="mt-3 text-xs sm:text-sm text-[#17233B] leading-relaxed">
                    Hey everyone! Our team is building an open-source campus ride-sharing and carpool tool for day scholars. Looking for 1 frontend dev familiar with React & Tailwind! 🚀
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="text-[11px] bg-gray-100 text-[#17233B] px-2 py-0.5 rounded font-mono">
                      #React
                    </span>
                    <span className="text-[11px] bg-gray-100 text-[#17233B] px-2 py-0.5 rounded font-mono">
                      #OpenSource
                    </span>
                    <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">
                      1 Position Open
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-[#667085]">
                    <span className="flex items-center gap-1 text-[#5277D9] font-medium">
                      <Heart className="w-3.5 h-3.5 fill-[#5277D9]" /> 24 Kudos
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" /> 8 comments
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </span>
                  </div>
                </div>

                {/* 2. Mini Grid: Project Match & Campus Event Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Mini Project Collaboration Card */}
                  <div className="bg-white rounded-xl p-3.5 border border-[#E5E7EB] shadow-2xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold tracking-wider text-[#5277D9] uppercase flex items-center gap-1">
                        <FolderGit2 className="w-3 h-3" /> Project Teammate
                      </span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                        Need 1 Designer
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-[#17233B] line-clamp-1">
                      Smart Library Desk Booking
                    </h5>
                    <p className="text-[11px] text-[#667085] mt-1 line-clamp-2">
                      Need a UI/UX peer to wireframe mobile dashboard in Figma.
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] text-[#667085]">Aarav • Lead</span>
                      <span className="text-[11px] font-semibold text-[#5277D9]">Request →</span>
                    </div>
                  </div>

                  {/* Mini Campus Event Card */}
                  <div className="bg-white rounded-xl p-3.5 border border-[#E5E7EB] shadow-2xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold tracking-wider text-purple-600 uppercase flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Hackathon
                      </span>
                      <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-medium">
                        This Weekend
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-[#17233B] line-clamp-1">
                      Annual 48h Campus Hackathon
                    </h5>
                    <p className="text-[11px] text-[#667085] mt-1">
                      Tech Hub Lab 4 • Mentorship & prizes
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] text-emerald-600 font-medium">150+ RSVP'd</span>
                      <span className="text-[11px] font-semibold text-[#5277D9]">Details →</span>
                    </div>
                  </div>
                </div>

                {/* 3. Community Pill Preview */}
                <div className="bg-white rounded-xl p-3 border border-[#E5E7EB] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#5277D9] text-white flex items-center justify-center font-bold text-xs">
                      WD
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#17233B]">Web Dev Guild</p>
                      <p className="text-[10px] text-[#667085]">190+ peers • Discussion active now</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#5277D9] font-medium hover:underline">
                    Join Guild
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
