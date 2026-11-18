# Aapli Varg Sabha (आपली वर्ग सभा)

A Marathi-first collaborative civic education web application where middle-school students (Classes 6–8) create, discuss, vote on, amend, and govern their own classroom constitution.

## Project Overview

Instead of learning democracy solely from textbooks, students practise democracy directly inside their classroom community:

- **Propose**: Students draft classroom Rights (हक्क), Duties (कर्तव्ये), and Articles (कलमे) with written rationale.
- **Discuss**: Peers express informal support/disagreement (likes & dislikes) and discuss through threaded comments and replies.
- **Vote Formally**: Teachers open a formal voting round separately from informal reactions. Each enrolled student casts one formal Approve or Reject vote. Proposals pass to teacher review only when `Approve votes > Reject votes`.
- **Teacher Review**: Teachers act as constitutional facilitators—approving into the active constitution, rejecting with an explanation, requesting reconsideration, or vetoing with justification.
- **Amendments & Version History**: Students can propose amendments to existing constitutional provisions. Approved amendments update the active constitution while preserving immutable snapshots in `constitutionalItems/{itemId}/versions`.
- **Classroom Interest Litigation (CIL)**: Students can formally question existing rules or daily practices in a structured educational simulation of fair reconsideration.

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, React Router, Tailwind CSS v4, Lucide Icons
- **Backend & Database**: Firebase Firestore (`firebase` SDK) with hardened `firestore.rules`
- **Authentication**: Google Sign-In via Firebase Authentication (`signInWithPopup`)
- **Language**: Marathi-first (`mr`) with centralized English (`en`) interface toggle
- **Hosting Target**: Vercel static SPA (`vercel.json` included)

## Installation & Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
   The app runs on `http://localhost:3000`.
3. Firebase configuration is read from `/firebase-applet-config.json`, and security rules are defined in `/firestore.rules`.

## Deployment on Vercel

1. Push this repository to GitHub (or connect directly in Vercel).
2. Import the project in **Vercel** using the **Vite** framework preset:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - `vercel.json` is already configured with SPA rewrites (`/(.*) -> /index.html`).
3. **Important for Firebase Google Sign-In on Vercel**:
   - After your first Vercel deployment, copy your production domain (e.g. `your-app.vercel.app` or your custom domain).
   - Open **Firebase Console -> Authentication -> Settings -> Authorized domains** and add your Vercel domain so Google Sign-In popups succeed in production.

## Classroom Onboarding Workflow

1. **Teacher**: Sign in with Google, choose **I am a Teacher**, and create a classroom (or click the sample Marathi classroom button) with a unique classroom code (e.g. `ET01`) and authorised roll numbers (e.g. `ET01001, ET01002`).
2. **Student**: Sign in with Google, choose **I am a Student**, and enter the classroom code and roll number. Each roll number can only be claimed once.
