# Design Document — Aapli Varg Sabha (आपली वर्ग सभा)

## 1. Educational Purpose

Aapli Varg Sabha treats a middle-school classroom (Classes 6–8) as a living democratic community. Rather than reading abstract definitions of rights, duties, and constitutional amendments from a civics textbook, students:

1. Identify shared classroom needs and propose Rights, Duties, and Articles with explicit reasoning.
2. Practise respectful peer discussion and distinguish **informal opinion** (likes/dislikes) from **formal democratic voting**.
3. Experience constitutional checks and balances: majority vote (`approve > reject`) advances a proposal, while teacher review ensures fairness, safety, and reflection.
4. Understand that constitutions evolve through **Amendments** (preserving history) and **Classroom Interest Litigation (CIL)** (questioning unfair rules peacefully).

## 2. Target Learner Context

- **Learners**: Rural government school students, ages 11–14 (Classes 6–8).
- **Devices & Connectivity**: Shared Android smartphones, ~30-minute evening sessions, intermittent or low bandwidth.
- **Language**: Marathi (`mr`) primary interface using simple, everyday Devanagari vocabulary, paired with an optional English (`en`) toggle that translates UI chrome without altering stored classroom provisions.
- **Usability**: Mobile-first bottom tab navigation, minimum 44px touch targets, stacked card layouts instead of wide data tables, and zero gamified leaderboards.

## 3. User Roles & Server-Side Access Control

- **Student**: Signs in with Google, enrols via a teacher-authorised `(classroomCode, rollNumber)` pair, drafts proposals, reacts informally, discusses/replies, casts one formal vote per voting round, revises proposals returned for reconsideration, proposes amendments, and raises CIL concerns.
- **Teacher**: Signs in with Google, creates classrooms, sets drafting deadlines and lifecycle stages (`drafting`, `active`, `closed`), authorises student roll numbers, opens/closes formal voting rounds, and makes final constitutional decisions (`approved`, `rejected`, `reconsideration`, `vetoed`).

All sensitive state transitions and invariants are enforced server-side in `/firestore.rules` (using atomic batched writes with `existsAfter`/`getAfter`, strict field whitelists, timestamp validation, and PII isolation), rather than relying solely on client UI checks.

## 4. Database Architecture (Firebase Firestore)

Schema defined in `/firebase-blueprint.json`:

- `profiles/{userId}` + `profiles/{userId}/private/info` — user display name, role (`student` | `teacher`), workspace preferences, and isolated email PII.
- `classroomCodes/{code}` — unique classroom code lookup index pointing to `classroomId`.
- `classrooms/{classroomId}` — classroom metadata, `classroomCode`, `teacherId`, deadline, and lifecycle status (`drafting` | `active` | `closed`).
- `classrooms/{classroomId}/rollNumbers/{rollNumber}` — pre-approved roll numbers per classroom with atomic `claimedBy` lock.
- `classrooms/{classroomId}/enrollments/{studentId}` — verified student-classroom membership.
- `classrooms/{classroomId}/proposals/{proposalId}` — unified proposal entity supporting `right`, `duty`, `article`, `amendment`, and `cil`, tracking `votingRound` and teacher decisions.
  - Subcollections: `reactions/{studentId}`, `votes/{votingRound}_{studentId}`, `comments/{commentId}`.
- `classrooms/{classroomId}/constitutionalItems/{itemId}` — active approved provisions separated cleanly from pending proposals.
  - Subcollection: `versions/{versionNumber}` — immutable version snapshots preserved whenever an item is created (v1) or amended (v2, v3...).
- `classrooms/{classroomId}/participationLogs/{logId}` — activity records for balanced participation counts.

## 5. Key Design Decisions & Limitations

- **Static Vite SPA + Firebase Firestore/Auth for Vercel**: Deploys directly to Vercel static CDN (`dist/`) without requiring a persistent Node/SQL server, while enforcing classroom membership, one-vote-per-round, and teacher-approval rules inside `firestore.rules`.
- **Deterministic Educational Guidance**: Contextual Marathi prompts and misconception feedback are deterministic and built directly into the authoring flows—no AI chatbot or generated constitutional rules are used.
- **Known Scope Limits**: Refresh-based data reads (rather than persistent WebSocket listeners) keep mobile bandwidth minimal; multi-school district hierarchies are outside the MVP scope.
