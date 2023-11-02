// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCSCXJLpmwOx0K_9g8mB1kJCKPcsQc5Dow",
  authDomain: "english-game-99ac3.firebaseapp.com",
  projectId: "english-game-99ac3",
  storageBucket: "english-game-99ac3.appspot.com",
  messagingSenderId: "169386453817",
  appId: "1:169386453817:web:94b1edf2c724a0243e16e8",
  measurementId: "G-YTXLELTPXC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const dbChat = getDatabase();
export const storage = getStorage();
export default app;
