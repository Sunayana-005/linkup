import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Firebase configuration - replace with your own config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDV-MPeKox28dGIGzWUFYJmXHNbrSvyBuI",
  authDomain: "linkup-fea66.firebaseapp.com",
  projectId: "linkup-fea66",
  storageBucket: "linkup-fea66.firebasestorage.app",
  messagingSenderId: "404063211017",
  appId: "1:404063211017:web:470ea2d556d9607df872d8"
};

const app = initializeApp(firebaseConfig);

// Use React Native persistence for auth
let auth: ReturnType<typeof getAuth>;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // If already initialized, just get it
  auth = getAuth(app);
}

const firestore = getFirestore(app);

export { app, auth, firestore };
