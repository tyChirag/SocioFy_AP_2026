import { Users, FolderGit2, MessageSquare } from 'lucide-react';
import SectionHeading from '../common/SectionHeading';
import FeatureCard from '../common/FeatureCard';

/**
 * Features Section
 * Combines campus features into three compact, high-impact cards:
 * 1. Connect (Users icon)
 * 2. Collaborate (FolderGit2 icon)
 * 3. Communicate (MessageSquare icon)
 */
const Features = () => {
  const simplifiedFeatures = [
    {
      id: 'connect',
      title: 'Connect',
      description:
        'Discover students, join interest-based communities, and meet people who share your interests.',
      icon: Users,
      accentColor: '#5277D9',
      points: [
        'Explore verified campus student directory',
        'Join interest hubs and academic clubs',
        'Expand your personal college network',
      ],
    },
    {
      id: 'collaborate',
      title: 'Collaborate',
      description:
        'Find project teammates, share ideas, explore opportunities, and build something together.',
      icon: FolderGit2,
      accentColor: '#5277D9',
      points: [
        'Post project ideas and recruit teammates',
        'Match skills across engineering and design',
        'Collaborate on hackathons and coursework',
      ],
    },
    {
      id: 'communicate',
      title: 'Communicate',
      description:
        'Stay connected through private messages, group conversations, and campus event updates.',
      icon: MessageSquare,
      accentColor: '#5277D9',
      points: [
        'Direct 1-on-1 private messaging',
        'Community discussion channels',
        'Real-time campus event announcements',
      ],
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-20 bg-[#F8F9FC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <SectionHeading
          badge="Features"
          title="Everything Your Campus Needs, In One Place."
          description="Connect with students, discover opportunities, and build meaningful relationships within your campus community."
          align="center"
        />

        {/* 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {simplifiedFeatures.map((feature) => (
            <FeatureCard
              key={feature.id}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              accentColor={feature.accentColor}
              points={feature.points}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
