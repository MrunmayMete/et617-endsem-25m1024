# Security Specification — Aapli Varg Sabha (आपली वर्ग सभा)

## 1. Data Invariants

1. **No Self-Assigned Admin/Teacher Privileges**: Users creating a `/profiles/{userId}` document can only initialize `role: 'student'` and cannot mutate `role` afterward. Teacher privileges over a classroom come strictly from owning that classroom (`classroom.teacherId == request.auth.uid`).
2. **PII Isolation**: User emails live in `/profiles/{userId}/private/info`, strictly readable only by `request.auth.uid == userId`.
3. **Single-Claim Roll Numbers**: An authorised roll number in `/classrooms/{classroomId}/rollNumbers/{rollNumber}` can only be claimed once (`existing().claimedBy == null`) in an atomic transaction creating `/enrollments/{request.auth.uid}`.
4. **Teacher Cannot Enrol or Vote as Student**: The classroom's `teacherId` cannot create an enrollment or cast a formal vote in their own classroom.
5. **Single Formal Vote Per Round**: Votes at `/votes/{round}_{studentId}` can only be created by enrolled students while `proposal.status == 'voting'`, cannot be updated or deleted, and atomically increment `approveCount` or `rejectCount`.
6. **Majority Rule Enforcement**: Closing voting transitions to `pending_teacher_review` ONLY if `approveCount > rejectCount`, and `not_passed` otherwise.
7. **Teacher-Only Constitutional Authority**: Only `classroom.teacherId` can open/close voting, issue decisions (`approved`, `rejected`, `reconsideration`, `vetoed`), or create/amend `constitutionalItems` and `versions`.
8. **Terminal State Locking**: Once a proposal reaches `approved`, `rejected`, or `vetoed`, no further client mutations are allowed.

## 2. "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)

1. **Role Escalation on Profile Create**: `{ fullName: "Attacker", role: "teacher", preferredMode: "teacher", language: "mr" }` -> DENIED (`role` must be `'student'`).
2. **Profile PII Read by Another User**: Non-owner `getDoc(/profiles/{otherUid}/private/info)` -> DENIED.
3. **Shadow Field Injection on Proposal Create**: Creating a proposal with `isApproved: true` or `status: "approved"` -> DENIED (`status` must be `'discussion'`, `keys().hasOnly(...)` blocks extra fields).
4. **Unenrolled User Creating Proposal**: Authenticated user without `/enrollments/{uid}` writing to `/classrooms/{cid}/proposals/{pid}` -> DENIED.
5. **Student Approving Own Proposal**: Enrolled student updating `status: "approved"` or `teacherDecision: "approved"` -> DENIED.
6. **Double Voting in Same Round**: Enrolled student attempting a second vote document or updating an existing `/votes/{round}_{uid}` -> DENIED.
7. **Voting Outside Active Voting Window**: Enrolled student creating a vote when `proposal.status == 'discussion'` -> DENIED.
8. **Teacher Voting as Student**: Classroom `teacherId` attempting to write `/votes/{round}_{teacherUid}` -> DENIED.
9. **Rejecting Without Explanation**: Teacher updating `status: "rejected"` with `teacherReason: ""` -> DENIED.
10. **Claiming Already-Claimed Roll Number**: Second student updating `/rollNumbers/ET01001` where `claimedBy != null` -> DENIED.
11. **Direct Mutation of Approved Constitution**: Student attempting `update` or `create` on `/constitutionalItems/{itemId}` -> DENIED.
12. **Client-Forged Timestamp / Oversized ID**: Creating a document with `createdAt: new Date(0)` instead of `request.time`, or an ID > 128 chars -> DENIED.
