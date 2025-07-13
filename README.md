# ShYft - PWA Shift Management App

ShYft is a modern, installable Progressive Web App (PWA) for managing employee shifts, built with Next.js, TypeScript, and Firebase. It provides a comprehensive solution for scheduling, user management, and pay calculation with a focus on a fast, reliable, and offline-first user experience.

## Features

- **PWA Ready**: Installable on mobile and desktop devices for a native app-like experience. The application is configured with a service worker for offline support and caching.
- **Secure Authentication**: Robust user login and registration system using Firebase Authentication, supporting email/password, Google, and GitHub social logins.
- **Role-Based Access Control**: A secure system with 'management' and 'staff' roles. All sensitive operations (like creating shifts or editing users) are protected by Firestore Security Rules and validated on the server via API routes.
- **Dynamic Shift Scheduling**: A dashboard with an interactive calendar where managers can view, create, edit, and delete shifts for staff members.
- **User Management**: A dedicated page for managers to view and edit user roles and information.
- **Automated Pay History**: A page for employees to view their calculated pay history based on the shifts they have worked.
- **Offline Functionality**: Users can view cached data and create/edit shifts even when offline. Changes are automatically synced with the server when the connection is restored.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 14+ (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/)
- **PWA & Caching**: [next-pwa](https://www.npmjs.com/package/next-pwa) with Workbox

## Getting Started

### Prerequisites

- Node.js (v20.x or later recommended)
- pnpm (or your preferred package manager like npm or yarn)
- A Firebase project with the an API key and service account credentials.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd shyft
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**

    Create a file named `.env.local` in the root of the project and add your Firebase project credentials. You can find these in your Firebase project settings.

    ```
    # Firebase Client SDK Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
    NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID

    # Firebase Admin SDK Configuration (for server-side API routes)
    # This should be a JSON string of your service account key
    FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
..."
    FIREBASE_CLIENT_EMAIL=your-service-account-email@...
    ```

### Running the Development Server

To run the application in development mode:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

To create an optimized production build of the application, run:

```bash
pnpm build
```

This command bundles the application, compiles the TypeScript, and optimizes all assets for the best performance. After the build is complete, you can start the production server:

```bash
pnpm start
```
