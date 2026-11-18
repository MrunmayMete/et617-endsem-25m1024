# Aapli Varg Sabha — Database Migration Plan for Vercel Hosting

Migrates **Aapli Varg Sabha (आपली वर्ग सभा)** from Supabase to **Firebase Firestore + Firebase Authentication (Google Sign-In)** so the entire application deploys cleanly to Vercel as a zero-server static Vite React app with persistent, serverless cloud storage.

## User Review & Critical Decisions

> [!IMPORTANT]
> Because you are hosting on **Vercel**, **Firebase Firestore with Firebase Google Auth** is the recommended database choice. Local SQLite files do not persist across Vercel's stateless deployments, and Cloud SQL PostgreSQL requires managing a persistent backend server and public IP/connection pooling. Firebase runs directly from the browser over HTTPS with server-enforced Firestore Security Rules and requires zero backend servers on Vercel.

- **Database Backend**: Switch from Supabase PostgreSQL to **Firebase Firestore** (provisioned directly inside AI Studio, then usable from Vercel by adding your Vercel domain to Firebase Authorized Domains).
- **Authentication**: Switch to **Firebase Google Sign-In** (`signInWithPopup`), preserving the real Google OAuth flow with zero fake login fallbacks.
- **Classroom Sample Data (Optional)**: Upon approval, we can include an optional teacher button to seed a starter Marathi classroom (`ET01` — Class 7A with sample roll numbers) or start completely empty.

---

## 1. Overview & Core Concept

- **What It Does**: Preserves 100% of Aapli Varg Sabha's democratic classroom constitution workflows—student enrollment via classroom code and authorised roll number, proposing Rights/Duties/Articles, informal likes/dislikes, threaded comments & replies, formal majority voting (`Approve > Reject`), teacher decisions (Approve, Reject, Reconsider, Veto), Amendments with preserved version history, and Classroom Interest Litigation (CIL).
- **Target Audience**: Middle-school students (Classes 6–8, ages 11–14) and teachers in rural Maharashtra using shared Android smartphones or classroom browsers.
- **Key Value for Vercel**: Deploying a static Vite bundle backed by Firestore eliminates server cold starts, Express hosting hurdles, and database connection pool limits on Vercel's free/hobby tier.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Landing & Login**: Marathi-first welcome screen -> Google Sign-In popup -> automatic role and enrollment check.
  2. **First-Time Onboarding**: Brand-new users choose Student (enter classroom code + authorised roll number) or Teacher (create classroom + authorise roll numbers).
  3. **Student Constitution Workspace**: Dashboard with 5 core modules (Rights, Duties, Articles, CIL, Amendments), 3 primary action buttons, and clean separation between approved provisions and pending proposals.
  4. **Democratic Proposal Lifecycle**: Draft with Marathi educational guidance -> peer discussion & informal reactions -> teacher opens formal voting -> students cast one vote per round -> majority (`Approve > Reject`) advances to teacher review -> teacher approves into constitution or explains decision.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Warm, welcoming civic-education community ledger tailored for middle-school learners.
  - *Color Palette*: 60% warm paper off-white (`#F8F7F4`), 30% crisp white cards with subtle hairline borders (`#E2E4EC`), 10% focal accents in Deep Civic Indigo (`#1E3A8A`) and Muted Saffron (`#D97706`), paired with explicit text-and-icon status labels (`#15803D` approved, `#B91C1C` rejected).
  - *Typography*: `Noto Sans Devanagari` paired with `Plus Jakarta Sans`, balanced headlines, and `tabular-nums` on vote tallies and roll numbers.
  - *Mobile-First Layout*: Sticky 56px top bar and 64px mobile bottom navigation bar (under 15% of mobile viewport height), minimum 44px touch targets, stacked cards instead of wide tables.
- **Interactive Feedback**: Clear Marathi loading indicators, validation alerts, deterministic educational misconception callouts, and Firestore permission/connectivity error boundaries.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Firebase Firestore vs. Cloud SQL PostgreSQL on Vercel**
  - *Chosen Approach*: **Firebase Firestore + Firebase Google Auth**.
  - *Why*: Vercel's static frontend hosting handles Vite SPAs natively with global CDN caching and zero server configuration. Firestore security rules enforce role-based access, one-vote-per-round constraints, and teacher-only approvals directly at the database layer without running a separate Node/Express server or managing PostgreSQL connection pools across serverless functions.
  - *Alternatives Considered*:
    - *Local SQLite via Express*: Unsuitable for Vercel because Vercel's serverless filesystem is ephemeral and resets between invocations.
    - *Cloud SQL PostgreSQL*: Strong relational model, but requires either a separate always-on Node server or public IP allowlisting + serverless pooling configuration for Vercel.

- **Decision 2: Atomic Transactions & Deterministic Document IDs for Relational Constraints**
  - *Chosen Approach*: Use Firestore `runTransaction` combined with deterministic composite document IDs (for example, `{classroomId}_{rollNumber}` for roll authorizations and enrollments, and `{proposalId}_{round}_{studentId}` for formal votes).
  - *Why*: Firestore is a NoSQL document store without SQL `UNIQUE` constraints. Deterministic document IDs checked inside `runTransaction` plus Firestore Security Rules mathematically guarantee that a roll number cannot be claimed twice and a student cannot cast multiple votes in the same round.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   Vercel Edge CDN (Static Vite React App)               │
│                                                                         │
│  ┌────────────────┐    ┌──────────────────┐    ┌─────────────────────┐  │
│  │ Auth & Context │───▶│ Constitution &   │───▶│ Democratic Workflow │  │
│  │ (Marathi / EN) │    │ Category Views   │    │ & Teacher Review    │  │
│  └───────┬────────┘    └────────┬─────────┘    └──────────┬──────────┘  │
└──────────┼──────────────────────┼─────────────────────────┼─────────────┘
           │                      │                         │
           ▼                      ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Google Firebase Serverless Backend                   │
│                                                                         │
│  ┌──────────────────────────┐      ┌─────────────────────────────────┐  │
│  │ Firebase Authentication  │      │ Cloud Firestore + Security Rules│  │
│  │ (Google Sign-In OAuth)   │─────▶│ • Transactions for Enrolment,   │  │
│  │                          │      │   Voting & Amendment Versioning │  │
│  └──────────────────────────┘      │ • Role & Membership Enforcement │  │
│                                    └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Model & Uniqueness Guarantees

- **Profiles (`profiles/{uid}`)**: Stores `fullName`, `email`, `role` (`student` | `teacher`), `language` (`mr` | `en`), and `createdAt`. Security rules block direct client-side escalation from `student` to `teacher` once enrolled.
- **Classrooms (`classrooms/{classroomId}`)**: Stores `classroomCode` (mapped via a lookup document `classroomCodes/{CODE}` for uniqueness), `name`, `description`, `teacherId`, `deadline`, and `status` (`drafting` | `active` | `closed`).
- **Authorised Roll Numbers (`classrooms/{classroomId}/rollNumbers/{rollNumber}`)**: Pre-authorised by the teacher with `claimedBy` initially `null`. Student enrollment runs a Firestore transaction verifying `claimedBy == null` and setting `claimedBy = uid`, while creating `classrooms/{classroomId}/enrollments/{uid}` atomically.
- **Constitutional Items & Versions (`classrooms/{classroomId}/constitutionalItems/{itemId}` & `.../versions/{versionNumber}`)**: Active approved provisions stay strictly separated from proposals. Approving an amendment runs a batch/transaction that increments `version`, updates the active item, and writes an immutable version snapshot to the `versions` subcollection.
- **Proposals (`classrooms/{classroomId}/proposals/{proposalId}`)**: Tracks `type` (`right` | `duty` | `article` | `amendment` | `cil`), `status`, `votingRound`, `rationale`, `teacherDecision`, and `teacherReason`.
- **Reactions, Formal Votes & Comments (Subcollections under each Proposal)**:
  - `reactions/{studentId}`: One informal reaction per student (updatable/deletable).
  - `votes/{round}_{studentId}`: Deterministic ID enforcing strictly one formal vote per student per round, allowed by security rules only while `proposal.status == 'voting'` and the user is an enrolled student (never a teacher voting or double-voting).
  - `comments/{commentId}`: Threaded comments and replies (`parentId`).

### Execution & Deployment Steps After Approval

1. Provision Firebase (Firestore + Google Auth) via AI Studio's interactive Firebase setup flow.
2. Define the schema blueprint and hardened Firestore Security Rules enforcing all student/teacher role boundaries, enrollment validation, and single-vote-per-round constraints, then validate and deploy the rules.
3. Replace the Supabase client layer with Firebase Auth & Firestore transactions while keeping every Marathi/English screen, educational prompt, and mobile-first UI component intact.
4. For Vercel deployment, simply push to GitHub, deploy with `npm run build` (`dist/`), and add your `*.vercel.app` domain under **Firebase Console → Authentication → Settings → Authorized Domains** (no secret keys or backend server required).
