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
  Heart,
  Send,
} from 'lucide-react';
import PrimaryButton from '../common/PrimaryButton';

/**
 * Hero Section
 * Main focus of the landing page:
 * - Headline: "Your Campus. Your People. Your Community."
 * - Description: "Discover students who share your interests, connect with like-minded people, collaborate on projects, and stay connected with your campus through SocioFy."
 * - Buttons: "Get Started" (/signup) and "Explore Features" (scrolls to #features)
 * - Visual: Realistic, compact product preview with student profile, community info, project collaboration, and small messaging preview.
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
    <section id="top" className="relative overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-18 lg:pt-16 lg:pb-20">
      {/* Subtle decorative background gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#E8EDF7]/70 via-[#F8F9FC]/40 to-transparent blur-3xl -z-10"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Headline, Description & CTAs (6 cols on lg) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-6 flex flex-col text-left"
          >
            {/* College Exclusive Badge */}
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-[#E8EDF7] border border-[#5277D9]/20 text-[#5277D9] text-xs font-semibold tracking-wide uppercase mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Exclusively for College Students</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#17233B] tracking-tight leading-[1.18]">
              Your Campus.{' '}
              <span className="text-[#5277D9]">Your People.</span>{' '}
              <span className="block sm:inline lg:block text-[#17233B]">Your Community.</span>
            </h1>

            {/* Description */}
            <p className="mt-5 text-base sm:text-lg text-[#667085] leading-relaxed max-w-xl">
              Discover students who share your interests, connect with like-minded people, collaborate on projects, and stay connected with your campus through SocioFy.
            </p>

            {/* Action Buttons */}
            <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <PrimaryButton
                size="md"
                variant="primary"
                to="/signup"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Get Started
              </PrimaryButton>
              <PrimaryButton
                size="md"
                variant="secondary"
                onClick={() => scrollToSection('features')}
              >
                Explore Features
              </PrimaryButton>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 pt-5 border-t border-[#E5E7EB] flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[#667085]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified student IDs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero spam, college-focused</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Free for campus students</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Realistic Product Preview Window (6 cols on lg) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="lg:col-span-6 w-full"
          >
            {/* Outer Mockup Container */}
            <div className="relative mx-auto max-w-lg lg:max-w-none rounded-2xl bg-white border border-[#E5E7EB] shadow-xl overflow-hidden">
              {/* App Window Header Bar */}
              <div className="bg-[#17233B] px-4 py-3 flex items-center justify-between text-white border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 text-xs font-medium text-gray-300">
                    SocioFy — Campus Feed
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white font-mono">
                  Live Preview
                </span>
              </div>

              {/* Subheader / Tabs bar */}
              <div className="bg-[#F8F9FC] border-b border-[#E5E7EB] px-4 py-2 flex items-center justify-between text-xs text-[#667085]">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-[#5277D9] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> Feed
                  </span>
                  <span className="text-[#667085] flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5" /> Hubs
                  </span>
                  <span className="text-[#667085] flex items-center gap-1">
                    <FolderGit2 className="w-3.5 h-3.5" /> Projects
                  </span>
                </div>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                  Verified Student
                </span>
              </div>

              {/* Feed Content Area */}
              <div className="p-4 sm:p-5 space-y-3.5 bg-[#F8F9FC]/60">
                {/* 1. Student Profile & Feed Post */}
                <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-[#E5E7EB] shadow-2xs">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#5277D9]/15 text-[#5277D9] font-bold flex items-center justify-center text-xs border border-[#5277D9]/30">
                        SP
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs sm:text-sm font-bold text-[#17233B]">Sneha Patel</h4>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#E8EDF7] text-[#5277D9] font-medium">
                            CS &apos;26
                          </span>
                        </div>
                        <p className="text-[11px] text-[#667085]">Computer Science Dept • 15m ago</p>
                      </div>
                    </div>
                    <span className="text-[11px] px-2.5 py-1 rounded-lg bg-[#E8EDF7] text-[#5277D9] font-medium">
                      Connected
                    </span>
                  </div>

                  <p className="mt-2.5 text-xs sm:text-sm text-[#17233B] leading-relaxed">
                    Working on an AI study assistant for campus exams. Looking for 1 teammate familiar with React! 🚀
                  </p>

                  <div className="mt-2.5 flex items-center justify-between text-xs text-[#667085] pt-2 border-t border-gray-100">
                    <span className="flex items-center gap-1 text-[#5277D9] font-medium text-[11px]">
                      <Heart className="w-3.5 h-3.5 fill-[#5277D9]" /> 28 Kudos
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <MessageSquare className="w-3.5 h-3.5" /> 6 comments
                    </span>
                  </div>
                </div>

                {/* 2. Side-by-side Project Collaboration & Community Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Project Collaboration Preview */}
                  <div className="bg-white rounded-xl p-3 border border-[#E5E7EB] shadow-2xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold tracking-wider text-[#5277D9] uppercase flex items-center gap-1">
                        <FolderGit2 className="w-3 h-3" /> Collaboration
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                        Open
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-[#17233B] truncate">
                      Campus Library Desk Booking
                    </h5>
                    <p className="text-[11px] text-[#667085] mt-1 line-clamp-1">
                      Teammate search for UI/UX wireframing
                    </p>
                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      <span className="text-[#667085]">Lead: Aarav</span>
                      <span className="font-semibold text-[#5277D9]">Join Team →</span>
                    </div>
                  </div>

                  {/* Community Hub Information */}
                  <div className="bg-white rounded-xl p-3 border border-[#E5E7EB] shadow-2xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold tracking-wider text-purple-600 uppercase flex items-center gap-1">
                        <Compass className="w-3 h-3" /> Community
                      </span>
                      <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-medium">
                        Active
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-[#17233B] truncate">
                      Web & App Dev Guild
                    </h5>
                    <p className="text-[11px] text-[#667085] mt-1 line-clamp-1">
                      180+ campus developers sharing knowledge
                    </p>
                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-600 font-medium">12 online now</span>
                      <span className="font-semibold text-[#5277D9]">View Hub →</span>
                    </div>
                  </div>
                </div>

                {/* 3. Small Messaging Preview */}
                <div className="bg-white rounded-xl p-3 border border-[#E5E7EB] shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-[#17233B] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        RM
                      </div>
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-[#17233B] truncate">Rohan Mehta</p>
                        <span className="text-[10px] text-[#667085]">Just now</span>
                      </div>
                      <p className="text-[11px] text-[#667085] truncate">
                        &quot;Hey! Are you free for the hackathon prep meet?&quot;
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 pl-2">
                    <span className="w-7 h-7 rounded-lg bg-[#E8EDF7] text-[#5277D9] flex items-center justify-center">
                      <Send className="w-3.5 h-3.5" />
                    </span>
                  </div>
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
