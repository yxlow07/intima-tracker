# Implementation Plan - Intima Tracker

## Goal Description
Build a minimal tracking system where admins manage activity forms, users track status via secure unique links, and a public homepage displays activities under review.

## User Review Required
> [!IMPORTANT]
> I will use **Next.js** (App Router) with **SQLite** for a self-contained, easy-to-deploy solution.
> Authentication for Admin will be a simple password protection (Environment Variable) to keep it minimal as requested.
> **Constraint**: Keep all files under 300 lines to ensure modularity.
> Do not use PRISMA

## Proposed Changes

### Project Structure
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS (Premium aesthetics)
- **Database**: SQLite

### Database Schema
#### [NEW] `schema.sql`
- `Activity` table:
    - `id`: String (UUID)
    - `title`: String
    - `description`: String?
    - `status`: String (e.g., "Pending", "Under Review", "Approved", "Rejected")
    - `uniqueToken`: String (Unique index, for user access)
    - `createdAt`: DateTime
    - `updatedAt`: DateTime

### Features

#### Admin Dashboard (`/admin`)
- Login page (checks against `ADMIN_PASSWORD` env var).
- Dashboard to:
    - Create new Activity (generates unique link).
    - View all activities.
    - Delete activities.
    - Copy unique links to share with users.

#### Public Homepage (`/`)
- Displays list of activities with status "Under Review" (or similar public statuses).
- Clean, modern card layout.

#### User Tracking Page (`/track/[token]`)
- Accessible only via the unique token.
- Shows current status of the activity.
- (Optional) Allow user to update status if that's the requirement ("users track their status" - usually means *view*, but "manage activity forms" implies Admin manages. "Users track their status" implies viewing. I will assume View-only for users unless "track" implies input. The prompt says "users track their status", usually implies passive tracking, but I'll add a simple "Add Note" or "Acknowledge" if needed. For now, View Status is primary).

## Verification Plan
### Automated Tests
- None planned for "minimal" MVP, but will verify via Browser.

### Manual Verification
- **Admin**: Log in, create activity, verify unique link generation.
- **Public**: Check homepage shows only appropriate items.
- **User**: Visit unique link, verify details are visible and correct.

---

# Database Schema Update Plan

## Goal
Update the database schema for Activity table and create a new `Logs` table. Refactor the application to use the new schema, specifically renaming `title` to `activityName` and adding new fields.

## Status
✅ **COMPLETED** - All changes implemented and verified.

### Database Schema Changes (src/lib/schema.sql)
- ✅ Dropped existing Activity table and recreated with new schema
- ✅ Added Activity table with:
    - `id` (TEXT PRIMARY KEY)
    - `activityName` (TEXT NOT NULL) - *Renamed from title*
    - `description` (TEXT)
    - `activityDate` (DATETIME) - *New*
    - `activityType` (TEXT) - *New*
    - `affiliate` (TEXT) - *New*
    - `status` (TEXT DEFAULT 'Pending')
    - `publicViewCount` (INTEGER DEFAULT 0) - *New*
    - `uniqueToken` (TEXT UNIQUE)
    - `createdAt` (DATETIME DEFAULT CURRENT_TIMESTAMP)
    - `updatedAt` (DATETIME DEFAULT CURRENT_TIMESTAMP)
- ✅ Created `Logs` table with:
    - `id` (TEXT PRIMARY KEY)
    - `timestamp` (DATETIME DEFAULT CURRENT_TIMESTAMP)
    - `log` (TEXT)
    - `activityId` (TEXT, FOREIGN KEY to Activity.id)

### Data Access Layer (src/lib/activity.ts)
- ✅ Updated Activity type definition
- ✅ Updated createActivity, getAllActivities, getActivityById, getActivityByToken, updateActivity functions
- ✅ Added publicViewCount increment logic
- ✅ Added functions for Logs (createLog, getLogsForActivity)

### UI Components
- ✅ Updated src/app/page.tsx to use `activityName`
- ✅ Updated src/app/track/[token]/page.tsx to use `activityName`
- ✅ Updated src/app/admin/activities/page.tsx with new columns
- ✅ Updated src/app/admin/activities/new/page.tsx with new fields
- ✅ Updated src/app/admin/activities/[id]/edit/page.tsx with new fields

### Verification
- ✅ Database schema successfully updated
- ✅ All CRUD operations working with new fields
- ✅ UI components display and accept new fields correctly
- ✅ No breaking errors in application
