import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration for movie recommender app
// IMPORTANT: Replace these placeholder values with your actual Firebase project configuration
// See FIREBASE_SETUP.md for detailed setup instructions
export const firebaseConfig = {
  apiKey: "AIzaSyAMOkjY0LV22n8JhCRsK3xuP2wc3MvUj1w",
  authDomain: "movie-recommender-b2306.firebaseapp.com",
  projectId: "movie-recommender-b2306",
  storageBucket: "movie-recommender-b2306.firebasestorage.app",
  messagingSenderId: "25944521927",
  appId: "1:25944521927:web:908804f55ba8ea6e3ad2e2"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);