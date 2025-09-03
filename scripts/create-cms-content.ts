import { PrismaClient, BlockType } from '@prisma/client';

const prisma = new PrismaClient();

async function createSampleCMSContent() {
  try {
    console.log('Creating sample CMS content...');

    // Create a sample content item
    const content = await prisma.content.create({
      data: {
        title: 'Building a Modern Web Application',
        description: 'A comprehensive guide to building scalable web applications with modern technologies.',
        contentType: 'blog',
        category: 'DEVELOPMENT',
        author: 'Sid',
        tags: ['web-development', 'react', 'typescript', 'best-practices'],
        status: 'PUBLISHED',
        slug: 'building-modern-web-application',
        imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
        contentBlocks: {
          create: [
            {
              blockType: 'HEADING',
              order: 0,
              data: { text: 'Introduction', level: 2 }
            },
            {
              blockType: 'PARAGRAPH',
              order: 1,
              data: { 
                text: 'Building modern web applications requires careful consideration of architecture, performance, and user experience. In this comprehensive guide, we\'ll explore the key principles and technologies that make for successful web applications.' 
              }
            },
            {
              blockType: 'HEADING',
              order: 2,
              data: { text: 'Key Technologies', level: 2 }
            },
            {
              blockType: 'LIST',
              order: 3,
              data: { 
                type: 'unordered',
                items: [
                  'React for component-based UI development',
                  'TypeScript for type safety and better developer experience',
                  'Next.js for server-side rendering and routing',
                  'Tailwind CSS for utility-first styling',
                  'Prisma for database management'
                ]
              }
            },
            {
              blockType: 'HEADING',
              order: 4,
              data: { text: 'Architecture Principles', level: 2 }
            },
            {
              blockType: 'PARAGRAPH',
              order: 5,
              data: { 
                text: 'A well-designed architecture provides the foundation for scalable and maintainable applications. Let\'s explore the core principles that guide successful implementations.' 
              }
            },
            {
              blockType: 'QUOTE',
              order: 6,
              data: { 
                text: 'Good architecture is invisible. Bad architecture is everywhere.',
                author: 'Martin Fowler',
                source: 'Patterns of Enterprise Application Architecture'
              }
            },
            {
              blockType: 'HEADING',
              order: 7,
              data: { text: 'Implementation Example', level: 2 }
            },
            {
              blockType: 'PARAGRAPH',
              order: 8,
              data: { 
                text: 'Here\'s a practical example of how to implement a clean component architecture in React with TypeScript.' 
              }
            },
            {
              blockType: 'CODE_BLOCK',
              order: 9,
              data: { 
                language: 'typescript',
                code: `interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-4">
        {user.avatar && (
          <img 
            src={user.avatar} 
            alt={user.name}
            className="w-12 h-12 rounded-full"
          />
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
          <p className="text-gray-600">{user.email}</p>
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(user)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(user.id)}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};`
              }
            },
            {
              blockType: 'HEADING',
              order: 10,
              data: { text: 'Best Practices', level: 2 }
            },
            {
              blockType: 'LIST',
              order: 11,
              data: { 
                type: 'ordered',
                items: [
                  'Start with a clear project structure',
                  'Use TypeScript for better type safety',
                  'Implement proper error handling',
                  'Write comprehensive tests',
                  'Follow consistent coding standards',
                  'Document your code and APIs'
                ]
              }
            },
            {
              blockType: 'DIVIDER',
              order: 12,
              data: { style: 'solid' }
            },
            {
              blockType: 'HEADING',
              order: 13,
              data: { text: 'Conclusion', level: 2 }
            },
            {
              blockType: 'PARAGRAPH',
              order: 14,
              data: { 
                text: 'Building modern web applications is both an art and a science. By following established best practices, using the right tools, and maintaining a focus on user experience, you can create applications that are not only functional but also delightful to use.' 
              }
            },
            {
              blockType: 'PARAGRAPH',
              order: 15,
              data: { 
                text: 'Remember that technology evolves rapidly, so stay updated with the latest trends and continue learning. The journey to becoming a better developer is ongoing, and each project brings new challenges and opportunities for growth.' 
              }
            }
          ]
        }
      }
    });

    console.log('Sample CMS content created successfully!');
    console.log('Content ID:', content.id);
    console.log('Content created successfully!');

  } catch (error) {
    console.error('Error creating sample CMS content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleCMSContent();
