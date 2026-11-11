import { highlightsData } from '../../data/highlights';

/**
 * Stats Component (Platform Highlights)
 * Focuses on core feature-based highlights and campus pillars
 * without using fabricated user numbers, fake metrics, or deceptive testimonials.
 */
const Stats = () => {
  return (
    <section className="py-12 bg-white border-y border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Intro Tag */}
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#5277D9]">
            Built Specifically for University Life
          </p>
          <h3 className="mt-1 text-lg sm:text-xl font-bold text-[#17233B]">
            Four Core Pillars Powering Your Campus Experience
          </h3>
        </div>

        {/* Highlights 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlightsData.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="group relative p-5 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB] transition-all duration-200 hover:border-[#5277D9]/40 hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#E8EDF7] text-[#5277D9] flex items-center justify-center shrink-0 group-hover:bg-[#5277D9] group-hover:text-white transition-colors duration-200">
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#17233B] tracking-tight">
                      {item.title}
                    </h4>
                    <span className="text-[11px] font-medium text-[#5277D9]">
                      {item.subtitle}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Stats;
