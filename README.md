# Intima Tracker

A minimal activity tracking system where admins manage activity forms, users track status via secure unique links, and a public homepage displays activities under review.

## Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org) (App Router) with React 19 + TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) with animations
- **Database**: [SQLite](https://www.sqlite.org) (better-sqlite3)
- **Backend**: Next.js API routes (serverless functions)
- **Authentication**: Simple password-based (environment variable)
- **Additional Libraries**: 
  - Google AI API (`@google/genai`)
  - Google APIs (`googleapis`)
  - Email support (`nodemailer`)
  - File uploads (`react-dropzone`)

## Core Features

### Admin Dashboard (`/admin`)
- Password-protected login
- Create, edit, and delete activities
- Manage affiliate ideas and SAP forms
- View activity logs and public view counts
- Generate and copy unique tracking links for users

### User Tracking (`/track/[token]`)
- Secure access via unique tokens
- View activity status and details
- Submit activity management forms (SAP uploads, affiliate ideas)

### Public Homepage (`/`)
- Display activities marked for public viewing
- Calendar view for SAP activities
- Activity idea submissions

### Database Schema
Three main tables power the application:
- **Activity**: Tracks all activities with status, form type, and unique tokens
- **Logs**: Maintains audit trail of activity changes
- **AffiliateIdea**: Stores affiliate partnership submissions

Activities support multiple form types (SAP, affiliate ideas) with unique token-based access control and view count tracking.

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

``bash
npm install
``

### Development

``bash
npm run dev
``

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

``bash
npm run db:init
``

This initializes the SQLite database using the schema defined in `src/lib/schema.sql`.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:init` - Initialize database

## Deployment

### Recommended Hosting Options

1. **Vercel** (Easiest)
   - Official Next.js hosting platform
   - Built-in SQLite support
   - Free tier available
   - Automatic deployments from Git
   - [Deploy now](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=intima-tracker)

2. **Railway or Fly.io**
   - Excellent for SQLite + Node.js applications
   - Better database persistence
   - Affordable starter plans
   - Suitable for production workloads

3. **Self-hosted VPS** (Linode, Digital Ocean, AWS EC2)
   - Full control and customization
   - Persistent storage for SQLite
   - Use `npm run build && npm start`
   - Requires Node.js 18+

### Important Note on SQLite

SQLite works best with persistent storage. Vercel''s serverless environment resets frequently, making it less suitable for production SQLite databases. For production deployments, Railway, Fly.io, or self-hosted solutions are recommended.

### Environment Variables

Create a `.env.local` file:

``
ADMIN_PASSWORD=your_secure_password_here
``

## Project Structure

``
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── calendar/          # Calendar view
│   ├── track/[token]/     # User tracking page
│   └── ideas/             # Public ideas page
├── components/            # Reusable React components
├── lib/                   # Utilities and database functions
│   └── schema.sql        # SQLite database schema
└── public/               # Static assets
``

## Learn More