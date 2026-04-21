## Executive Summary
We have developed a platform for students to digitally propose club ideas and find like-minded peers to form executive committees. The system is fully functional and ready to deploy.  
(https://intima-tracker.vercel.app/ideas)[Affiliate Ideas Board]

## Problem Statement
Despite a vibrant student body, the process of establishing a new club is currently inefficient due to three main barriers: 
-	Discovery: Students with innovative ideas lack a centralized channel to broadcast them, often relying on word-of-mouth.
-	Team Formation: Many potential clubs fail to launch simply because the founder cannot find the requisite number of committee members (e.g., a treasurer or secretary) within their immediate social circle. 
-	Club continuation: Many EXCO cannot find people to take over their club

## Solution
We have developed a dedicated **Affiliate Idea & Recruitment** platform. This web-based module allows any student to submit a structured proposal for a new club or affiliate. The system provides a public directory where students can browse approved ideas and see exactly which committee positions (e.g., President, Treasurer, Publicity) are vacant, facilitating immediate team formation.

## Key Features
- **Structured Idea Submission:** Students use a standardized form to input their affiliate name, description, required positions, and contact details.
- **Approval Workflow:** A built-in admin dashboard allows the INTIMA to review, approve, or reject submissions, ensuring quality control before public listing.
- **Dynamic Recruitment Board:** The public "Ideas" page displays only approved initiatives, highlighting open positions to attract potential EXCO members.
- **Direct Connection:** Integrated contact information allows interested peers to reach out directly to the founder.

## Benefits
- **Centralized Broadcast:** Eliminates the fragmented nature of word-of-mouth or isolated social media posts.
- **Accelerated Team Formation:** Directly solves the "missing member" problem by advertising specific vacancies.
- **Validated Interest:** Acts as a proof-of-concept phase; if a founder can recruit a team here, the club has a higher chance of long-term success.

## Implementation Plan
The module is fully developed and integrated into the Intima Tracker ecosystem (Next.js & MongoDB). The specific components are:

### 1. Public-Facing Portal (`/ideas`)
-   **Idea Submission:** A "Propose Affiliate Idea" modal allows students to submit proposals (Name, Description, Open Positions, Contact Info).
-   **Browsing Interface:** A grid view displays all *Approved* ideas. Cards highlight the "Positions Open" to encourage engagement.
-   **Validation:** Student email domains (`@student.newinti.edu.my`) are validated to ensure only current students can submit.

### 2. Administrative Dashboard (`/admin/ideas`)
-   **Review Request:** Admins can view all ideas, including those pending approval.
-   **Moderation Tools:** Proposals can be edited (to fix typos), Approved, or Rejected.
-   **Status Control:** Only ideas marked "Approved" become visible on the public page.

### 3. Backend Architecture
-   **Database:** A MongoDB collection `affiliateIdeas` stores all proposals.
-   **API:** RESTful endpoints (`/api/affiliate-ideas`) handle secure CRUD operations, ensuring public users cannot approve their own ideas.

### 4. Deployment & Launch
-   **Status:** The code is complete and tested.
-   **Rollout:** The module can be activated immediately by merging the current feature branch.
-   **Maintenance:** Requires INTIMA Activities Team to periodically review the Admin Dashboard for new submissions.

## Resources
- **Platform:** Existing Intima Operations Tracker infrastructure (Next.js & MongoDB).
- **Personnel:** INTIMA Activities Team for moderation.

### Hosting Costs
This platform is hosted on Vercel's Hobby plan, which is free of charge. The code does not incur additional hosting costs and it provides a free domain which we can use to host the platform. The platform is reputable and in Long Term Support (LTS). 

## Conclusion
By lowering the barrier to entry for finding teammates, this Affiliate Idea Board will unlock the potential of the INTIMA, leading to a more diverse and active campus life.


## FAQ

### How can it sustain?
The platform is built on **zero-cost infrastructure** (Vercel Hobby + Firebase Realtime DB) with minimal maintenance requirements. Sustainability is ensured through:
- **Self-service model:** Students submit and browse ideas without admin intervention for day-to-day operations
- **Low maintenance:** Only periodic moderation of submissions is required
- **Knowledge transfer:** Technical documentation enables future developers to maintain and extend the platform
- **Ownership transfer:** The platform will be transferred to INTIMA's official accounts for institutional continuity

### How do the security being handle?
Security is implemented at multiple layers:
- **Authentication:** Admin dashboard is password-protected with session-based authentication
- **Authorization:** API endpoints validate admin credentials before allowing write operations
- **Input validation:** All user inputs are sanitized to prevent injection attacks
- **Domain restriction:** Only `@student.newinti.edu.my` emails can submit proposals

### How is student data protected at rest and in transit?
- **In Transit:** All data is transmitted over `HTTPS` (TLS encryption) enforced by Vercel
- **At Rest:** Firebase Realtime DB encrypts all data at rest using AES-256 encryption by default
- **Minimal Data Collection:** We only collect necessary information (name, email, proposal details) — no sensitive personal data including student data is stored.

### How to avoid public and non INTIan access to the app?
- **Email Validation:** Proposal submissions require a valid `@student.newinti.edu.my` email address
- **Read-only Public Access:** Non-authenticated users can only view approved ideas (no modification rights)
- **Admin Protection:** Administrative functions require authentication credentials

### What happens if the platform exceeds the Vercel 'Hobby' limits during peak recruitment?
Vercel Hobby limits are generous (100GB bandwidth, 100 hours serverless execution/month). However, if exceeded:
- **Immediate:** The site may experience temporary downtime until the billing cycle resets
- **Realistic Assessment:** Based on projected traffic (few hundred users), we are unlikely to exceed these limits. 
    - Vercel provides 1 million edge requests/month on Hobby plan, which is sufficient for our use case
    - For DDOS attacks, Vercel has built-in protections to mitigate such threats

### Who 'owns' the root account for Vercel and Firebase?
Currently it is under my account, but it can be transferred to under INTIMA's Google Account.
- **Transfer Process:** Both Vercel and Firebase support project/organization transfers

### Is it possible to add a secondary account for admin to handle?
Yes, multiple approaches are available:
- **Vercel:** Team members can be invited to the Vercel project with appropriate roles
- **Firebase:** Additional users can be added to the Firebase project
- **Application Level:** Multiple admin accounts can be created in the system's admin configuration

### If accidently deleted the details, is it possible to recover back?
- **Firebase Realtime DB:** Provides point-in-time recovery and automated backups (even on free tier, daily snapshots are available)
- **Vercel:** Deployment history is preserved, allowing rollback to previous versions
- **Improvement:** A log of changes can be maintained for critical operations

### Do you have a 'Decision Log' and technical documentation for the next developer?
- **Current State:** Basic README exists with setup instructions
- **Improvement Plan:** A comprehensive handover document can be prepared including:
  - Architecture decisions and rationale
  - Environment setup guide
  - API documentation
  - Database schema explanations
  - Troubleshooting guide

### I also understand that Vercel Hobby data owns by Vercel. How to protect the student data?
This is a common misconception. **Vercel does not own your data:**
- Vercel's Terms of Service state that customers retain ownership of their content
- Vercel only hosts the application code; the actual student data resides in **Firebase Realtime Database** (separate service)

### Why choose to use Vercel as there are many different AI in the market?
I believe you mean "many different hosting platforms" rather than AI. Vercel was chosen because:
- **Free tier:** No hosting costs for student projects
- **Next.js optimization:** Vercel is built by the creators of Next.js, ensuring best-in-class performance
- **Zero configuration:** Automatic deployments from GitHub with no DevOps expertise required
- **Reliability:** Enterprise-grade infrastructure with 99.99% uptime SLA
- **Developer experience:** Easy rollbacks, preview deployments, and built-in analytics

### Why do we need to use this where we can use IG to help find ppl? As the App is only for the club to find likeminded people and IG already have their own existing follower.
While Instagram is excellent for engagement, the Affiliate Idea Board solves different problems:

| Aspect | Instagram | Affiliate Idea Board |
|--------|-----------|---------------------|
| **Discovery** | Only reaches existing followers | Centralized directory visible to all students |
| **Structure** | Unstructured posts get buried in feed | Permanent, searchable listings with specific position vacancies |
| **Filtering** | No way to filter by interest/position | Students can browse by open roles they're interested in |
| **Persistence** | Stories disappear; posts get buried | Ideas remain visible until positions are filled |
| **Artwork** | Requires designing artwork for posts | Standardized format for easy comparison |

**The platforms complement each other:** Use Instagram for awareness/engagement, and direct interested students to the Idea Board for structured sign-ups.

### How to encourage people to use this and attract ppl? As IG can be more interactive.
Adoption strategies:
1. **Integration with Instagram:** Promote the Idea Board via INTIMA's Instagram; link in bio
2. **QR Codes:** Display at orientation events and club fairs
3. **Ease of Use:** The simple interface requires no app download — just visit the website

**Key differentiator:** Instagram builds awareness; the Idea Board converts interest into action with structured team formation.