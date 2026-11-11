import { Users, Compass, FolderGit2, CalendarDays } from 'lucide-react';

/**
 * Main feature cards data for the Features section
 * Each item contains title, description, key bullet points, and an icon
 */
export const featuresData = [
  {
    id: 'connect',
    title: 'Connect with Students',
    badge: 'Peer Discovery',
    description: 'Discover students from your college and expand your authentic academic and creative network.',
    points: [
      'Discover students from your college',
      'Explore their skills, interests, departments, and projects',
      'Follow or connect with like-minded people',
    ],
    icon: Users,
    accentColor: '#5277D9',
  },
  {
    id: 'communities',
    title: 'Build Communities',
    badge: 'Interest Hubs',
    description: 'Join interest-based clubs and student circles to exchange ideas and share resources.',
    points: [
      'Join communities based on your interests',
      'Participate in discussions',
      'Share knowledge and resources',
      'Meet students with similar interests',
    ],
    icon: Compass,
    accentColor: '#3B82F6',
  },
  {
    id: 'projects',
    title: 'Collaborate on Projects',
    badge: 'Team Building',
    description: 'Find motivated peers to turn ideas into hackathon submissions, startups, or coursework projects.',
    points: [
      'Discover ongoing student projects',
      'Find teammates based on required skills',
      'Share project ideas',
      'Request to join project teams',
    ],
    icon: FolderGit2,
    accentColor: '#10B981',
  },
  {
    id: 'events',
    title: 'Discover Campus Events',
    badge: 'Campus Pulse',
    description: 'Never miss out on what is happening across departments, clubs, and student organizations.',
    points: [
      'Explore upcoming college events',
      'Discover workshops, hackathons, and competitions',
      'Register for events',
      'Stay updated with campus activities',
    ],
    icon: CalendarDays,
    accentColor: '#F59E0B',
  },
];

