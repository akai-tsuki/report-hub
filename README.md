# Report Hub

A React-based reporting system with threaded discussions, using Firebase for authentication and data storage.

## Features

- Google Authentication for user login
- Report listing with tree-based threaded discussions
- Pagination for efficient handling of large report lists
- Create new threads and posts with customizable fields:
  - Author name (defaults to user display name)
  - Group assignment
  - Recipient information
  - Title and content
- Reply to existing posts with full context
- Group management for better organization
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
|   |-- ReportContent.tsx      # Report content page
|   `-- GroupSettings.tsx      # Group management page
|-- services/
|   |-- auth.ts                # Authentication services
|   |-- firebase.ts            # Firebase configuration
|   `-- reports.ts             # Report data services (threads, posts, groups)
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
4. Set up Firestore Security Rules:
   - Go to Firestore Database > Rules
   - Update the rules with the content from `firestore.rules` or copy the rules below:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // ユーザー認証済みかどうかのチェック関数
       function isAuthenticated() {
         return request.auth != null;
       }
       
       // 指定されたドキュメントの作成者かどうかをチェックする関数
       function isAuthor(resource) {
         return resource.data.authorId == request.auth.uid;
       }
       
       // すべてのユーザーは認証されていれば読み取り可能、書き込みは自分の作成したものだけ
       match /threads/{threadId} {
         allow read: if isAuthenticated();
         allow create: if isAuthenticated() && request.resource.data.authorId == request.auth.uid;
         allow update, delete: if isAuthenticated() && isAuthor(resource);
       }
       
       match /posts/{postId} {
         allow read: if isAuthenticated();
         allow create: if isAuthenticated() && request.resource.data.authorId == request.auth.uid;
         allow update, delete: if isAuthenticated() && isAuthor(resource);
       }
       
       // グループは認証されたユーザーならだれでも読み取り可能
       // グループの作成・編集・削除権限は必要に応じて制限してください
       match /groups/{groupId} {
         allow read: if isAuthenticated();
         // 本番環境では必要に応じて制限を追加
         allow write: if isAuthenticated();
       }
     }
   }
   ```
5. Update the Firebase configuration in `src/services/firebase.ts` with your project credentials:
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
  - Fields: title, createdAt, authorId, authorName, rootPostId, group, recipient

- **posts**: For individual posts within threads
  - Fields: content, createdAt, updatedAt, authorId, authorName, authorPhotoURL, parentId, threadId, childrenIds, group, recipient, title

- **groups**: For organization group management
  - Fields: name, createdAt

This structure allows for efficient queries and maintains the threaded discussion hierarchy while providing organization through groups.

## Deployment

To build the app for production:

```
npm run build
```

You can then deploy the contents of the `build` directory to any static hosting service like Firebase Hosting, Vercel, Netlify, etc.

### Firebase Hosting Setup

For deployment to Firebase Hosting:

1. Install Firebase CLI globally (if not already installed):
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```
   firebase login
   ```

3. Initialize Firebase in your project directory:
   ```
   firebase init
   ```
   - Select Hosting
   - Choose your Firebase project
   - Set public directory to `build`
   - Configure as a single-page app: Yes
   - Set up automatic builds and deploys with GitHub: No (or Yes if desired)

4. Deploy to Firebase:
   ```
   firebase deploy
   ```

### Security Considerations for Production

Before deploying to production, ensure the following security measures are in place:

1. **Enforce Firestore Security Rules**: The provided rules restrict access based on authentication and ownership. Review and modify as needed for your specific requirements.

2. **Admin Controls**: If you need admin functionality, consider implementing custom claims in Firebase Auth to designate admin users.

3. **Rate Limiting**: Consider implementing rate limiting for API calls to prevent abuse.

4. **Environment Variables**: Store sensitive configuration in environment variables rather than directly in the code.

5. **Regular Backups**: Set up regular backups of your Firestore data.

6. **Monitoring**: Enable Firebase monitoring to track usage and detect anomalies.

## Technologies Used

- React
- TypeScript
- Firebase (Authentication and Firestore)
- Material-UI
- React Router

## Usage

1. **Login**: Access the application and authenticate with your Google account.
2. **View Reports**: Browse through the list of existing report threads.
3. **Create Thread**: Click "New Thread" button to create a new discussion thread.
   - Fill in your name (defaults to your Google account name)
   - Optionally select a group for categorization
   - Add recipient information if needed
   - Provide a title and content for your thread
4. **Reply to Posts**: Click the "Reply" button on any post to respond.
   - Include optional fields like group, recipient, and title
5. **Manage Groups**: Navigate to Group Settings from the Reports page.
   - Add, edit, or delete groups as needed
   - Groups will be available for selection when creating posts or threads