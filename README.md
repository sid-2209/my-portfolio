# Portfolio & Content Management System

A modern, full-stack portfolio platform with an integrated headless CMS, built for showcasing content with rich media support and advanced editing capabilities.

---

## ✦ Overview

This project combines a sleek portfolio frontend with a powerful content management system, enabling dynamic content creation through a block-based editor with support for multiple content types, charts, code blocks, and multimedia embeds.

---

## ✦ Core Features

### Content Management System
- **Block-based Editor** — Modular content creation with 12+ block types
- **Rich Text Editing** — Full formatting support with inline components
- **Revision History** — Track changes and restore previous versions
- **Templates & Snippets** — Reusable content patterns for efficient authoring
- **Draft/Publish Workflow** — Content status management with versioning

### Advanced Chart Support
- **Multi-Part Charts** — HTML + CSS + JavaScript with library auto-detection
- **Library Support** — Chart.js, D3.js, Mermaid, Recharts
- **Visual Editor** — No-code chart creation for common chart types
- **CSS Scoping** — Isolated styles prevent global leakage
- **Dynamic Loading** — CDN-based library injection on demand

### Media Management
- **Vercel Blob Integration** — Cloud storage for images, videos, audio
- **Drag-and-Drop Upload** — Intuitive file management interface
- **Metadata Support** — Alt text, captions, dimensions tracking
- **Organized Folders** — Automatic categorization by source and type

### Audio/Video Features
- **Multi-Platform Support** — YouTube, Vimeo, Spotify, SoundCloud, Loom
- **Sticky Mini Player** — Persistent playback across page navigation
- **WaveSurfer Integration** — Visual waveform display for audio
- **Embed API** — Unified interface for multiple providers

### Content Blocks
```
├─ Paragraph       │ Rich text with inline formatting
├─ Heading         │ H1-H4 with customizable styling
├─ Image           │ Responsive images with captions
├─ Video Embed     │ Multi-platform video support
├─ Audio Embed     │ Podcast/music player integration
├─ Code Block      │ Syntax highlighting, 50+ languages
├─ Chart           │ Interactive data visualizations
├─ Quote           │ Styled blockquotes with attribution
├─ List            │ Ordered and unordered lists
├─ Divider         │ Visual section separators
├─ Callout         │ Highlighted information boxes
├─ Table           │ Responsive data tables
└─ Custom HTML     │ Arbitrary HTML with script support
```

---

## ✦ Technology Stack

### Frontend
- **Next.js 15** — React framework with Turbopack
- **React 19** — UI library with latest features
- **TypeScript** — Type-safe development
- **Tailwind CSS 4** — Utility-first styling

### Backend & Database
- **Prisma ORM** — Type-safe database client
- **PostgreSQL** — Primary data store
- **NextAuth** — Authentication & session management
- **Vercel Blob** — Media storage solution

### Visualization & Media
- **Chart.js** — Canvas-based charts
- **D3.js** — SVG data visualizations
- **Mermaid** — Diagram generation
- **Recharts** — React chart library
- **WaveSurfer.js** — Audio waveform renderer

### Developer Tools
- **DOMPurify** — XSS protection for user content
- **Lucide React** — Icon library
- **React Syntax Highlighter** — Code block rendering
- **DnD Kit** — Drag-and-drop interactions
- **Zod** — Runtime validation

---

## ✦ Getting Started

### Prerequisites
```bash
Node.js 18+
PostgreSQL database
Vercel account (for blob storage)
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Update the following in `.env.local`:
   ```env
   # Database
   POSTGRES_URL="your-postgres-url"
   PRISMA_DATABASE_URL="your-postgres-url"

   # NextAuth
   AUTH_SECRET="<generate-with-openssl-rand-base64-32>"
   NEXTAUTH_URL="http://localhost:3000"

   # Admin Credentials
   ADMIN_EMAIL="your-email@example.com"
   ADMIN_PASSWORD_HASH="<generate-with-bcryptjs>"

   # Vercel Blob (optional, for media uploads)
   BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
   ```

4. **Initialize database**
   ```bash
   npm run db:push
   npm run seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

---

## ✦ Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── admin/               # CMS admin interface
│   ├── api/                 # API routes (content, media, auth)
│   ├── content/[id]/        # Dynamic content pages
│   └── page.tsx             # Homepage
├── components/
│   ├── cms/                 # CMS editor components
│   │   ├── BlockEditor.tsx
│   │   ├── BlockRenderer.tsx
│   │   ├── ChartEditor.tsx
│   │   └── RichTextEditor.tsx
│   ├── ui/                  # Reusable UI components
│   └── audio/               # Audio player components
├── lib/                     # Utility libraries
│   ├── chartLibraryLoader.ts
│   ├── chartLibraryDetector.ts
│   └── prisma.ts
├── utils/                   # Helper functions
│   ├── scopeChartCSS.ts
│   └── colorSelection.ts
├── contexts/                # React contexts
├── hooks/                   # Custom React hooks
└── styles/                  # Global styles

prisma/
└── schema.prisma            # Database schema

scripts/
├── seed.ts                  # Database seeding
└── sample-content.ts        # Sample content generation
```

---

## ✦ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:generate` | Generate Prisma client |
| `npm run seed` | Seed database with initial data |
| `npm run sample` | Generate sample content |

---

## ✦ Key Concepts

### Block-Based Architecture
Content is composed of modular blocks, each with its own type, data structure, and rendering logic. This enables:
- Flexible content layouts
- Reorderable sections via drag-and-drop
- Type-safe content editing
- Consistent rendering across pages

### Multi-Part Chart System
Supports full HTML/CSS/JavaScript chart implementations with:
- Automatic library detection (Chart.js, D3, Mermaid)
- CDN-based dynamic loading
- CSS scoping to prevent style leakage
- Chart.js instance cleanup for canvas reuse

### Revision Control
Every content change is tracked with:
- Automatic version numbering
- Block-level change detection (added/modified/removed)
- Point-in-time restoration
- Change summaries for easy review

### Media Pipeline
```
Upload → Vercel Blob → Database Record → Component Reference
```
- Automatic MIME type detection
- Dimension extraction for images
- Duration calculation for videos
- Organized folder structure

---

## ✦ Admin Interface

Access the CMS at `/admin` after authentication:

- **Content Management** — Create, edit, publish content
- **Media Library** — Upload and manage assets
- **Templates** — Save content patterns for reuse
- **Snippets** — Store reusable content blocks
- **Revision History** — View and restore previous versions

---

## ✦ Security Features

- **DOMPurify Sanitization** — All user HTML is sanitized
- **CSS Scoping** — Chart styles isolated to containers
- **Type Validation** — Zod schemas for API inputs
- **NextAuth Integration** — Secure authentication
- **XSS Protection** — Inline script controls
- **CSRF Protection** — Built-in Next.js security

---

## ✦ Performance Optimizations

- **Turbopack** — Fast development builds
- **Dynamic Imports** — Code splitting for chart libraries
- **Image Optimization** — Vercel Blob CDN delivery
- **Database Indexing** — Optimized queries on key fields
- **React 19** — Latest performance improvements
- **Edge Runtime** — Fast API responses

---

## ✦ Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `POSTGRES_URL` | PostgreSQL connection string | Yes |
| `PRISMA_DATABASE_URL` | Prisma database URL | Yes |
| `AUTH_SECRET` | NextAuth secret key | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `ADMIN_EMAIL` | Admin user email | Yes |
| `ADMIN_PASSWORD_HASH` | Bcrypt password hash | Yes |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage token | No* |

*Required for media uploads

---

## ✦ Database Schema

### Core Models
- **Content** — Main content entries (posts, projects, notes)
- **ContentBlock** — Individual content blocks
- **ContentRevision** — Version history snapshots
- **Media** — Uploaded files metadata
- **ContentTemplate** — Reusable content structures
- **ContentSnippet** — Reusable content fragments

### Relationships
```
Content 1──┬──* ContentBlock
           ├──* ContentRevision
           └──* Media (via contentId)

ContentRevision 1──* ContentBlockRevision

ContentTemplate 1──* TemplateBlock
```

---

## ✦ Deployment

### Recommended Platform: Vercel

1. **Connect repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Set up PostgreSQL** database (Vercel Postgres or external)
4. **Enable Vercel Blob** for media storage
5. **Deploy** — Automatic builds on git push

### Database Migration
```bash
# Production database
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

---

## ✦ Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## ✦ License

This project is private and proprietary.

---

## ✦ Contributing

This is a personal portfolio project. For inquiries or collaboration:

**Sid**
[Contact information to be added]

---

<div align="center">

**Built with Next.js, TypeScript, and Prisma**

[Documentation](#) • [Report Bug](#) • [Request Feature](#)

</div>
