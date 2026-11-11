import { ArrowRight, Users2 } from 'lucide-react';
import SectionHeading from '../common/SectionHeading';
import { communitiesData } from '../../data/communities';

/**
 * CommunitiesPreview Section
 * Displays sample student-led interest communities across coding, AI,
 * design, photography, entrepreneurship, and competitive programming.
 */
const CommunitiesPreview = () => {
  return (
    <section id="communities" className="py-20 sm:py-24 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Interest Hubs"
          title="Find Your People"
          description="Explore communities built around your interests, hobbies, and ambitions."
          align="center"
        />

        {/* 6 Communities Grid: 3 cols desktop, 2 cols tablet, 1 col mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {communitiesData.map((community) => {
            const Icon = community.icon;

            return (
              <div
                key={community.id}
                className="group flex flex-col justify-between bg-[#F8F9FC] rounded-2xl border border-[#E5E7EB] p-6 transition-all duration-300 hover:bg-white hover:shadow-lg hover:border-[#5277D9]/40"
              >
                <div>
                  {/* Top Bar: Icon + Sample Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#5277D9] shadow-2xs group-hover:bg-[#5277D9] group-hover:text-white group-hover:border-[#5277D9] transition-all duration-300">
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>

                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white text-[#667085] border border-[#E5E7EB]">
                      {community.tag}
                    </span>
                  </div>

                  {/* Community Name */}
                  <h3 className="text-lg font-bold text-[#17233B] tracking-tight group-hover:text-[#5277D9] transition-colors duration-200">
                    {community.name}
                  </h3>

                  {/* Community Description */}
                  <p className="mt-2 text-sm text-[#667085] leading-relaxed">
                    {community.description}
                  </p>
                </div>

                {/* Footer: Member Count & Explore Button */}
                <div className="mt-6 pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#667085]">
                    <Users2 className="w-3.5 h-3.5 text-[#5277D9]" />
                    {community.members}
                  </span>

                  <button
                    type="button"
                    onClick={() => alert(`Exploring ${community.name} (Demonstration placeholder).`)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#5277D9] group-hover:translate-x-1 transition-transform cursor-pointer"
                  >
                    <span>Explore Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Demo Notice */}
        <div className="mt-10 text-center">
          <p className="text-xs text-[#667085]">
            * Showing sample communities. In the full platform, students can create verified campus guilds and custom clubs.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CommunitiesPreview;
