# Environment Setup Guide

## Overview

This project uses environment-specific configuration files to manage sensitive information like API keys and Firebase credentials. This approach ensures that secrets are not committed to version control.

## Environment Files Structure

- `src/environments/environment.ts` - Template with placeholder values (committed to repo)
- `src/environments/environment.prod.ts` - Production template with placeholder values (committed to repo)
- `src/environments/environment.local.ts` - Development secrets (NOT committed, gitignored)
- `src/environments/environment.prod.local.ts` - Production secrets (NOT committed, gitignored)

## Setup Instructions

### 1. Create Local Environment Files

Copy the template files and replace placeholder values with your actual credentials:

```bash
# Copy development template
cp src/environments/environment.ts src/environments/environment.local.ts

# Copy production template
cp src/environments/environment.prod.ts src/environments/environment.prod.local.ts
```

### 2. Configure TMDB API Key

1. Sign up at [The Movie Database (TMDB)](https://www.themoviedb.org/)
2. Go to Settings > API and generate an API key
3. Replace `YOUR_TMDB_API_KEY` in your local environment files

### 3. Configure Firebase

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Get your Firebase configuration from Project Settings > General > Your apps
4. Replace the Firebase placeholder values in your local environment files:
   - `YOUR_FIREBASE_API_KEY`
   - `YOUR_PROJECT_ID`
   - `YOUR_MESSAGING_SENDER_ID`
   - `YOUR_APP_ID`

### 4. Example Local Environment File

```typescript
export const environment = {
  production: false,
  tmdbApiKey: 'your-actual-tmdb-api-key-here',
  tmdbBaseUrl: 'https://api.themoviedb.org/3',
  tmdbImageBaseUrl: 'https://image.tmdb.org/t/p',
  firebase: {
    apiKey: 'your-firebase-api-key',
    authDomain: 'your-project-id.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project-id.firebasestorage.app',
    messagingSenderId: 'your-messaging-sender-id',
    appId: 'your-app-id'
  }
};
```

## Build Configurations

- **Development**: Uses `environment.local.ts` (with your actual secrets)
- **Production**: Uses `environment.prod.local.ts` (with your actual secrets)

## Security Notes

- Never commit files ending with `.local.ts` to version control
- The `.gitignore` file is configured to exclude these files
- Always use placeholder values in the template files (`environment.ts` and `environment.prod.ts`)
- For production deployment, ensure your CI/CD pipeline has access to the production secrets

## Troubleshooting

- If you get "environment not found" errors, ensure you've created the `.local.ts` files
- If Firebase authentication isn't working, verify your Firebase configuration
- If TMDB API calls fail, check your API key and ensure it's active