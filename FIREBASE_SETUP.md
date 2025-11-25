# Firebase Setup Guide

This app uses Firebase for authentication and data persistence. Follow these steps to set up Firebase:

## 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_API_KEY=your_api_key_here
NEXT_PUBLIC_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_PROJECT_ID=your_project_id
NEXT_PUBLIC_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_APP_ID=your_app_id
NEXT_PUBLIC_MEASUREMENT_ID=your_measurement_id
```

**Note:** You can also use the non-prefixed versions (API_KEY, AUTH_DOMAIN, etc.) if you prefer.

## 2. Firebase Console Setup

### Enable Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** > **Sign-in method**
4. Enable the following providers:
   - **Email/Password**
   - **Google** (configure OAuth consent screen)

### Create Firestore Database

1. Navigate to **Firestore Database**
2. Click **Create database**
3. Start in **Production mode**
4. Choose your preferred location

### Deploy Firestore Rules

1. Navigate to **Firestore Database** > **Rules**
2. Copy the contents of `firestore.rules` from this project
3. Paste into the Firebase Console rules editor
4. Click **Publish**

### Create Firestore Indexes

1. Navigate to **Firestore Database** > **Indexes**
2. Click **Create Index**
3. Import the indexes from `firestore.indexes.json` or create them manually:

**Index 1:**
- Collection: `loans`
- Fields: `userId` (Ascending), `createdAt` (Descending)

**Index 2:**
- Collection: `loans`
- Fields: `userId` (Ascending), `status` (Ascending)

**Index 3:**
- Collection: `transactions`
- Fields: `userId` (Ascending), `createdAt` (Descending)

**Index 4:**
- Collection: `transactions`
- Fields: `userId` (Ascending), `type` (Ascending), `createdAt` (Descending)

**Index 5:**
- Collection: `users`
- Fields: `userName` (Ascending)

## 3. Initialize Collections

Collections are created automatically when the first document is written. To initialize them manually:

### Option 1: Use the Admin Page (Recommended)
1. Start your dev server: `npm run dev`
2. Sign in to your app
3. Navigate to `/admin/init`
4. Click "Initialize Collections"
5. Check the browser console for confirmation

### Option 2: Use the Script
```bash
npm run init-firestore
```

Note: The script requires Firebase Admin SDK setup. Collections will be created automatically when users sign up or create their first loan/transaction.

## 4. Collections Structure

The app uses the following Firestore collections:

### `users`
- Stores user profiles, preferences, and game stats
- Document ID: User UID
- Fields: `userName`, `theme`, `xp`, `tier`, `balance`, `swopBalance`, `readyPlayerMeAvatar`, `selectedTemplate`, etc.

### `loans`
- Stores loan records
- Fields: `userId`, `amount`, `status`, `createdAt`, `dueDate`, etc.

### `transactions`
- Stores all transaction history
- Fields: `userId`, `type`, `amount`, `createdAt`, etc.

## 5. Testing

After setup, test the following:
1. Sign up with email/password
2. Sign in with Google
3. Create an avatar (should save to Firebase)
4. Update preferences (theme, name)
5. Create a loan
6. Send/receive SWOP payments

## Troubleshooting

- **"Missing Firebase environment variables"**: Ensure all env vars are set in `.env.local`
- **"Permission denied"**: Check Firestore rules are deployed correctly
- **"Index not found"**: Create the required indexes in Firebase Console
- **Auth not working**: Verify Email/Password and Google providers are enabled

