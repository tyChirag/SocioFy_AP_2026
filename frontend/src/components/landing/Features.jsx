import SectionHeading from '../common/SectionHeading';
import FeatureCard from '../common/FeatureCard';
import { featuresData } from '../../data/features';

/**
 * Features Section
 * Highlights the four main pillars of SocioFy:
 * 1. Connect with Students
 * 2. Build Communities
 * 3. Collaborate on Projects
 * 4. Discover Campus Events
 */
const Features = () => {
  return (
    <section id="features" className="py-20 sm:py-24 bg-[#F8F9FC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeading
          badge="Core Features"
          title="Everything You Need to Make Campus Life Better"
          description="SocioFy brings your campus community together in one place."
          align="center"
        />

        {/* 4-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {featuresData.map((feature) => (
            <FeatureCard
              key={feature.id}
              title={feature.title}
              badge={feature.badge}
              description={feature.description}
              points={feature.points}
              icon={feature.icon}
              accentColor={feature.accentColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
