import { useState } from 'react';
import { ArrowRight, GraduationCap, CheckCircle2, ShieldCheck } from 'lucide-react';
import PrimaryButton from '../common/PrimaryButton';

/**
 * CallToAction Section
 * Final high-conversion CTA encouraging college students to get started.
 * Consistent with the primary navy (#17233B) and primary blue (#5277D9) color palette.
 */
const CallToAction = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <section id="cta" className="py-20 sm:py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA Card with Deep Navy Background */}
        <div className="relative rounded-3xl bg-[#17233B] text-white p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl border border-gray-800">
          {/* Subtle background glow accents */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -bottom-20 w-96 h-96 bg-[#5277D9]/25 rounded-full blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-20 -top-20 w-80 h-80 bg-[#5277D9]/15 rounded-full blur-3xl"
          />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-semibold tracking-wide uppercase mb-6">
              <GraduationCap className="w-4 h-4 text-[#5277D9]" />
              <span>Campus Registration Open</span>
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Your Campus Has a Lot More to Offer.
            </h2>

            {/* Description */}
            <p className="mt-5 text-base sm:text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Meet new people, discover opportunities, and become part of a stronger campus community with SocioFy.
            </p>

            {/* Interactive Demo Form */}
            {submitted ? (
              <div className="mt-8 p-4 rounded-2xl bg-white/10 border border-emerald-400/40 text-emerald-300 max-w-md mx-auto flex items-center justify-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium">
                  Welcome to SocioFy! Demo invitation sent to {email}.
                </span>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your student college email..."
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#5277D9] focus:border-transparent transition-all"
                />
                <PrimaryButton
                  type="submit"
                  size="md"
                  variant="primary"
                  className="w-full sm:w-auto shrink-0 shadow-lg"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Get Started
                </PrimaryButton>
              </form>
            )}

            {/* Micro guarantees */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-y-2 gap-x-8 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#5277D9]" />
                <span>Verified .edu & university domains</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#5277D9]" />
                <span>No ads, pure campus collaboration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
