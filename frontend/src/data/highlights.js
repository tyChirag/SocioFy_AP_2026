import { Users, UsersRound, GitFork, Calendar } from 'lucide-react';

/**
 * Feature-based platform highlights for the Stats / Highlights section.
 * Focused on core platform pillars rather than fabricated counts or fake metrics.
 */
export const highlightsData = [
  {
    id: 'student-connections',
    title: 'Student Connections',
    subtitle: 'Verified Campus Peers',
    description: 'Connect with peers across departments, years, and specializations within your university.',
    icon: Users,
  },
  {
    id: 'interest-communities',
    title: 'Interest-Based Communities',
    subtitle: 'Curated Student Hubs',
    description: 'Find active groups centered around coding, design, entrepreneurship, arts, and sports.',
    icon: UsersRound,
  },
  {
    id: 'project-collaboration',
    title: 'Project Collaboration',
    subtitle: 'Cross-Functional Teams',
    description: 'Discover teammates by specific tech stacks and skills for hackathons and academic ventures.',
    icon: GitFork,
  },
  {
    id: 'campus-events',
    title: 'Campus Events',
    subtitle: 'Workshops & Hackathons',
    description: 'Stay informed on guest sessions, technical workshops, and campus-wide competitions.',
    icon: Calendar,
  },
];

