/**
 * Sample Posts Data for the Campus Feed
 * Realistic social media posts from college students.
 */
export const initialPostsData = [
  {
    id: 'post-1',
    author: {
      name: 'Sneha Patel',
      college: 'Delhi Technological University',
      department: 'Computer Science, 3rd Year',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      initials: 'SP',
    },
    timeAgo: '2 hours ago',
    content:
      'I just completed my first full-stack project using React and Node.js. Looking forward to building more projects with fellow developers! Feedback is welcome.',
    image: null,
    tag: '#WebDev #FullStack',
    likesCount: 24,
    isLiked: false,
    comments: [
      {
        id: 'c1',
        author: 'Rohan Mehta',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        initials: 'RM',
        timeAgo: '1 hour ago',
        text: 'Great work Sneha! Would love to see the GitHub repo.',
      },
    ],
  },
  {
    id: 'post-2',
    author: {
      name: 'Aarav Sharma',
      college: 'Delhi Technological University',
      department: 'Computer Science, 4th Year',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      initials: 'AS',
    },
    timeAgo: '4 hours ago',
    content:
      'Our college is organizing a hackathon next month. Looking for teammates interested in AI/ML and web development. Drop a comment or DM if interested!',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
    tag: '#Hackathon #TeamBuilding',
    likesCount: 42,
    isLiked: false,
    comments: [
      {
        id: 'c2',
        author: 'Ananya Verma',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        initials: 'AV',
        timeAgo: '3 hours ago',
        text: 'I can help with UI/UX prototyping in Figma! Count me in.',
      },
      {
        id: 'c3',
        author: 'Kunal Singh',
        avatar: '',
        initials: 'KS',
        timeAgo: '2 hours ago',
        text: 'Sent you a message Aarav, I work with PyTorch & FastAPI.',
      },
    ],
  },
  {
    id: 'post-3',
    author: {
      name: 'Priya Nair',
      college: 'Delhi Technological University',
      department: 'Information Technology, 2nd Year',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      initials: 'PN',
    },
    timeAgo: '6 hours ago',
    content:
      'What resources would you recommend for learning Data Structures and Algorithms? Looking for practice platforms and roadmap recommendations for upcoming placements.',
    image: null,
    tag: '#DSA #CareerPrep',
    likesCount: 31,
    isLiked: false,
    comments: [
      {
        id: 'c4',
        author: 'Sneha Patel',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        initials: 'SP',
        timeAgo: '5 hours ago',
        text: 'NeetCode 150 + Striver A2Z sheet is hands down the best combo!',
      },
    ],
  },
];
