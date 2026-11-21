import prisma from './prisma.js';

const initialCommunities = [
  {
    name: 'Web Development',
    description: 'Explore modern frontend and backend tech stacks, code reviews, open-source repositories, and web architecture.',
    tag: 'Technology',
    iconKey: 'Code2',
  },
  {
    name: 'Artificial Intelligence & Machine Learning',
    description: 'Deep dive into machine learning models, neural networks, Kaggle competitions, and generative AI systems.',
    tag: 'AI & Data',
    iconKey: 'Brain',
  },
  {
    name: 'Competitive Programming',
    description: 'Sharpen data structures and algorithms, take part in weekly contests, and prepare for tech interviews.',
    tag: 'Coding',
    iconKey: 'Terminal',
  },
  {
    name: 'Photography & Visual Arts',
    description: 'Join campus photo walks, share composition critiques, exchange gear tips, and document campus life.',
    tag: 'Creative',
    iconKey: 'Camera',
  },
  {
    name: 'Entrepreneurship & Startups',
    description: 'Brainstorm business ideas, validate market hypotheses, find co-founders, and prepare for pitch days.',
    tag: 'Business',
    iconKey: 'Rocket',
  },
  {
    name: 'Design and Creativity',
    description: 'Master UI/UX wireframing, design systems in Figma, typography, illustration, and product design.',
    tag: 'Design',
    iconKey: 'Palette',
  },
];

async function seedCommunities() {
  try {
    const existingCount = await prisma.community.count();
    if (existingCount > 0) {
      console.log(`Communities table already has ${existingCount} records. Skipping seed.`);
      return;
    }

    console.log('Seeding initial communities into the database...');
    for (const comm of initialCommunities) {
      await prisma.community.create({
        data: comm,
      });
      console.log(`Created community: ${comm.name}`);
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding communities:', error);
  } finally {
    process.exit(0);
  }
}

seedCommunities();
