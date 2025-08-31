import { PrismaClient } from '../node_modules/@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing content
  await prisma.content.deleteMany();
  console.log('🗑️  Cleared existing content');

  // Sample content data
  const sampleContent = [
    {
      title: 'RAG Explained: The Fusion of Search and Generation',
      description: 'An introduction to Retrieval-Augmented Generation, why it matters, and how it blends information retrieval with large language model reasoning.',
      contentType: 'blog',
      posterImage: null,
      contentUrl: 'https://example.com/rag-explained',
      author: 'Sid',
      tags: ['AI', 'Machine Learning', 'RAG', 'LLMs'],
    },
    {
      title: 'E-Commerce Platform with React & Node.js',
      description: 'A full-stack e-commerce solution featuring user authentication, product management, shopping cart, and payment integration with Stripe.',
      contentType: 'project',
      posterImage: null,
      contentUrl: 'https://github.com/sid-2209/ecommerce-platform',
      author: 'Sid',
      tags: ['React', 'Node.js', 'MongoDB', 'Stripe', 'E-commerce'],
    },
    {
      title: 'AI-Powered Task Management System',
      description: 'An intelligent task management application that uses machine learning to prioritize tasks, suggest optimal scheduling, and provide productivity insights.',
      contentType: 'case_study',
      posterImage: null,
      contentUrl: 'https://example.com/ai-task-management',
      author: 'Sid',
      tags: ['AI', 'Machine Learning', 'Productivity', 'Task Management'],
    },
    {
      title: 'Real-Time Chat Application',
      description: 'A modern chat application built with Next.js, Socket.io, and real-time messaging capabilities for seamless communication.',
      contentType: 'project',
      posterImage: null,
      contentUrl: 'https://github.com/sid-2209/chat-app',
      author: 'Sid',
      tags: ['Next.js', 'Socket.io', 'Real-time', 'Chat', 'WebRTC'],
    },
    {
      title: 'Data Analytics Dashboard',
      description: 'A comprehensive analytics dashboard that visualizes complex data sets with interactive charts, filters, and real-time updates.',
      contentType: 'case_study',
      posterImage: null,
      contentUrl: 'https://example.com/analytics-dashboard',
      author: 'Sid',
      tags: ['Data Visualization', 'Analytics', 'Dashboard', 'Charts'],
    },
    {
      title: 'The Future of Web Development',
      description: 'Exploring emerging trends in web development, from AI-powered tools to new frameworks and the evolution of developer experience.',
      contentType: 'blog',
      posterImage: null,
      contentUrl: 'https://example.com/future-web-dev',
      author: 'Sid',
      tags: ['Web Development', 'Trends', 'AI', 'Developer Experience'],
    },
  ];

  // Insert sample content
  for (const content of sampleContent) {
    await prisma.content.create({
      data: content,
    });
  }

  console.log(`✅ Successfully seeded ${sampleContent.length} content items`);
  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
