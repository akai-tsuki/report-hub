import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDkV6X9XVq6NLOeMBMfmiYc1-D5pLaDbJY",
  authDomain: "testapp-e457d.firebaseapp.com",
  projectId: "testapp-e457d",
  storageBucket: "testapp-e457d.firebasestorage.app",
  messagingSenderId: "528447070309",
  appId: "1:528447070309:web:22a7cc90b387e1b89d668c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);