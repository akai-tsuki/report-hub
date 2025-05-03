# Report Hub

A React-based reporting system with threaded discussions, using Firebase for authentication and data storage.

## Features

- Google Authentication for user login
- Report listing with tree-based threaded discussions
- Pagination for efficient handling of large report lists
- Create new threads and posts
- Reply to existing posts
- Real-time updates using Firebase

## Project Structure

```
src/
|-- components/
|   |-- auth/
|   |   `-- PrivateRoute.tsx   # Route protection component
|   |-- reports/
|       |-- ThreadListItem.tsx # Thread list item component
|       |-- PostTree.tsx       # Tree structure for posts
|       |-- NewThreadDialog.tsx # New thread creation modal
|       |-- NewPostDialog.tsx  # New post creation modal
|       `-- ReplyDialog.tsx    # Reply to post modal
|-- context/
|   `-- AuthContext.tsx        # Authentication context
|-- pages/
|   |-- Login.tsx              # Login page
|   |-- ReportsList.tsx        # Reports listing page
|   `-- ReportContent.tsx      # Report content page
|-- services/
|   |-- auth.ts                # Authentication services
|   |-- firebase.ts            # Firebase configuration
|   `-- reports.ts             # Report data services
|-- types/
|   `-- index.ts               # Type definitions
|-- utils/
|   `-- dateUtils.ts           # Date formatting utilities
|-- App.tsx                    # Main application component
`-- index.tsx                  # Application entry point
```

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
4. Enable Authentication (Google sign-in) and Firestore Database
5. Get your Firebase configuration and update `src/services/firebase.ts`
6. Start the development server:
   ```
   npm start
   ```

## Firebase Setup

1. Create a new project in the Firebase console
2. Enable Google Authentication:
   - Go to Authentication > Sign-in method
   - Enable Google provider
3. Set up Firestore Database:
   - Create a new Firestore database
   - Start in production mode
   - Choose a location closest to your users
4. Update the Firebase configuration in `src/services/firebase.ts` with your project credentials:
   ```typescript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

## Firestore Data Structure

The app uses the following Firestore collections:

- **threads**: For top-level thread information
  - Fields: title, createdAt, authorId, authorName, rootPostId

- **posts**: For individual posts within threads
  - Fields: content, createdAt, updatedAt, authorId, authorName, authorPhotoURL, parentId, threadId, childrenIds

This structure allows for efficient queries and maintains the threaded discussion hierarchy.

## Deployment

To build the app for production:

```
npm run build
```

You can then deploy the contents of the `build` directory to any static hosting service like Firebase Hosting, Vercel, Netlify, etc.

## Technologies Used

- React
- TypeScript
- Firebase (Authentication and Firestore)
- Material-UI
- React Router