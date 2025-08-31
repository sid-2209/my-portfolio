# Database Setup Guide: Vercel Postgres + Prisma

This guide will help you set up Vercel Postgres with Prisma for your portfolio content management system.

## 🚀 Quick Setup

### 1. Create Vercel Postgres Database

1. Go to [vercel.com](https://vercel.com) and sign in
2. Navigate to your portfolio project
3. Click on the **"Storage"** tab
4. Click **"Create Database"**
5. Select **"Postgres"**
6. Choose a region (closest to your target users)
7. Click **"Create"**

### 2. Environment Variables

Vercel will automatically add these environment variables to your project:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with sample content
npm run seed
```

## 📊 Database Schema

The system includes a `Content` table with the following structure:

```sql
CREATE TABLE "Content" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "contentType" TEXT NOT NULL,
  "posterImage" TEXT,
  "contentUrl" TEXT,
  "publishedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "author" TEXT NOT NULL DEFAULT 'Sid',
  "tags" TEXT[] NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- Indexes for performance
CREATE INDEX "Content_contentType_idx" ON "Content"("contentType");
CREATE INDEX "Content_publishedDate_idx" ON "Content"("publishedDate");
CREATE INDEX "Content_tags_idx" ON "Content" USING GIN ("tags");
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with sample content
- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate Prisma client

## 📝 Content Types

The system supports three content types:

1. **Projects** (`project`) - Portfolio projects and applications
2. **Case Studies** (`case_study`) - Detailed project analysis
3. **Blog** (`blog`) - Articles and technical writing

## 🎯 Features

- **Dynamic Content Loading** - Content loads based on sidebar selection
- **Search Functionality** - Search across titles, descriptions, and tags
- **Responsive Design** - Works on all device sizes
- **Performance Optimized** - Built-in caching and efficient queries
- **Type Safety** - Full TypeScript support with Prisma

## 🚀 Deployment

1. **Push to GitHub** - Your changes are automatically deployed
2. **Database Migration** - Vercel handles database migrations automatically
3. **Environment Variables** - Automatically configured in Vercel

## 🔍 API Endpoints

- `GET /api/content` - Fetch all content
- `GET /api/content/[type]` - Fetch content by type
- `GET /api/content/search?q=query` - Search content

## 📱 Usage

1. **View All Content** - Default view shows all content
2. **Filter by Type** - Click sidebar items to filter content
3. **Search Content** - Use the search bar in the navbar
4. **Click Content** - Click on content cards to open articles

## 🛠️ Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Ensure environment variables are set in Vercel
   - Check if database is running

2. **Prisma Client Error**
   - Run `npm run db:generate` to regenerate client
   - Ensure schema is up to date with `npm run db:push`

3. **Content Not Loading**
   - Check browser console for errors
   - Verify API endpoints are working
   - Ensure database has content (run `npm run seed`)

### Getting Help:

- Check Vercel deployment logs
- Review browser console for errors
- Verify environment variables are set correctly

## 🎉 Next Steps

1. **Add Real Content** - Replace sample content with your actual projects
2. **Customize Styling** - Modify the ContentCard component design
3. **Add Images** - Upload poster images to your preferred storage service
4. **Enhance Search** - Add advanced filtering and sorting options

Your content management system is now ready! 🚀
