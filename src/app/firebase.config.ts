import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { environment } from '../environments/environment';

// Firebase configuration for movie recommender app
// Configuration is loaded from environment variables for security
export const firebaseConfig = environment.firebase;

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);