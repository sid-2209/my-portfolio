import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PRISMA_DATABASE_URL,
    },
  },
});

async function main() {
  console.log('🌱 Starting sample content seeding...');
  console.log('🔗 Database URL:', process.env.PRISMA_DATABASE_URL ? 'Set' : 'Not set');

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Clear existing content
    await prisma.content.deleteMany();
    console.log('🗑️  Cleared existing content');

    // Sample content data
    const sampleContent = [
      // Featured Post (Hero Section)
      {
        title: 'The Future of AI in Web Development',
        description: 'Exploring how artificial intelligence is revolutionizing the way we build websites, from automated code generation to intelligent user experience optimization. This comprehensive guide covers the latest trends, tools, and techniques that every developer should know.',
        contentType: 'blog',
        category: 'AI & TECHNOLOGY',
        featured: true,
        imageUrl: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        contentUrl: 'https://example.com/ai-web-development',
        author: 'Sid',
        tags: ['AI', 'Web Development', 'Technology', 'Future'],
      },
      
      // Secondary Posts (Top Right Grid)
      {
        title: 'Building Scalable React Applications',
        description: 'Learn the best practices for creating React applications that can handle millions of users. From state management to performance optimization, this guide covers everything you need to know.',
        contentType: 'project',
        category: 'FRONTEND',
        featured: false,
        imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200&h=200&fit=crop',
        contentUrl: 'https://github.com/sid-2209/react-scalable-app',
        author: 'Sid',
        tags: ['React', 'JavaScript', 'Frontend', 'Scalability'],
      },
      {
        title: 'Machine Learning Case Study: E-commerce',
        description: 'How we implemented ML algorithms to increase conversion rates by 40% for a major e-commerce platform. This case study covers the entire process from data collection to deployment.',
        contentType: 'case_study',
        category: 'MACHINE LEARNING',
        featured: false,
        imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop',
        contentUrl: 'https://example.com/ml-ecommerce-case-study',
        author: 'Sid',
        tags: ['Machine Learning', 'E-commerce', 'Data Science', 'Case Study'],
      },
      {
        title: 'Next.js 15 Performance Optimization',
        description: 'Deep dive into the latest performance features in Next.js 15. Learn how to leverage Turbopack, streaming, and other optimizations to build lightning-fast applications.',
        contentType: 'blog',
        category: 'FRAMEWORKS',
        featured: false,
        imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&h=200&fit=crop',
        contentUrl: 'https://example.com/nextjs-15-performance',
        author: 'Sid',
        tags: ['Next.js', 'Performance', 'React', 'Web Development'],
      },
      
      // Tertiary Posts (Bottom Grid)
      {
        title: 'Design System Implementation',
        description: 'Creating a comprehensive design system that scales across multiple products and teams. This project showcases the power of consistent design tokens and component libraries.',
        contentType: 'project',
        category: 'DESIGN SYSTEMS',
        featured: false,
        imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200&h=200&fit=crop',
        contentUrl: 'https://github.com/sid-2209/design-system',
        author: 'Sid',
        tags: ['Design Systems', 'UI/UX', 'Components', 'Scalability'],
      },
      {
        title: 'Real-time Chat Application',
        description: 'A modern chat application built with WebSockets, featuring real-time messaging, file sharing, and end-to-end encryption. Perfect for learning real-time web development.',
        contentType: 'project',
        category: 'REAL-TIME',
        featured: false,
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop',
        contentUrl: 'https://github.com/sid-2209/real-time-chat',
        author: 'Sid',
        tags: ['WebSockets', 'Real-time', 'Chat', 'Web Development'],
      },
      {
        title: 'Data Visualization Dashboard',
        description: 'Interactive dashboard for visualizing complex datasets with D3.js and React. Features include real-time updates, custom charts, and responsive design.',
        contentType: 'case_study',
        category: 'DATA VIZ',
        featured: false,
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop',
        contentUrl: 'https://example.com/data-viz-dashboard',
        author: 'Sid',
        tags: ['Data Visualization', 'D3.js', 'React', 'Dashboard'],
      },
      {
        title: 'Microservices Architecture Guide',
        description: 'Comprehensive guide to building scalable applications with microservices. Covers service discovery, load balancing, and deployment strategies.',
        contentType: 'blog',
        category: 'ARCHITECTURE',
        featured: false,
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&h=200&fit=crop',
        contentUrl: 'https://example.com/microservices-guide',
        author: 'Sid',
        tags: ['Microservices', 'Architecture', 'Scalability', 'Backend'],
      },
      {
        title: 'Mobile App Development with React Native',
        description: 'Building cross-platform mobile applications that feel native on both iOS and Android. Learn the best practices and common pitfalls.',
        contentType: 'blog',
        category: 'MOBILE',
        featured: false,
        imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200&h=200&fit=crop',
        contentUrl: 'https://example.com/react-native-guide',
        author: 'Sid',
        tags: ['React Native', 'Mobile', 'Cross-platform', 'JavaScript'],
      },
      {
        title: 'Blockchain Development Fundamentals',
        description: 'Introduction to blockchain technology and smart contract development. Build your first decentralized application with Solidity and Web3.js.',
        contentType: 'project',
        category: 'BLOCKCHAIN',
        featured: false,
        imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200&h=200&fit=crop',
        contentUrl: 'https://github.com/sid-2209/blockchain-dapp',
        author: 'Sid',
        tags: ['Blockchain', 'Smart Contracts', 'Solidity', 'Web3'],
      },
      {
        title: 'DevOps Best Practices',
        description: 'Streamline your development workflow with modern DevOps practices. From CI/CD pipelines to infrastructure as code, this guide covers it all.',
        contentType: 'blog',
        category: 'DEVOPS',
        featured: false,
        imageUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=200&h=200&fit=crop',
        contentUrl: 'https://example.com/devops-best-practices',
        author: 'Sid',
        tags: ['DevOps', 'CI/CD', 'Infrastructure', 'Automation'],
      },
    ];

    // Insert sample content
    for (const content of sampleContent) {
      const result = await prisma.content.create({
        data: content,
      });
      console.log(`✅ Added: ${result.title} (${result.contentType})`);
    }

    console.log(`✅ Successfully seeded ${sampleContent.length} content items`);
    console.log('🎉 Sample content seeding completed!');
    
    // Display content summary
    const featured = await prisma.content.findFirst({ where: { featured: true } });
    const total = await prisma.content.count();
    console.log(`\n📊 Content Summary:`);
    console.log(`   Featured Post: ${featured?.title}`);
    console.log(`   Total Posts: ${total}`);
    console.log(`   Secondary Posts: 3 (top-right grid)`);
    console.log(`   Tertiary Posts: ${total - 4} (bottom grid)`);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
