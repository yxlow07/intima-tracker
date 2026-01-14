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
