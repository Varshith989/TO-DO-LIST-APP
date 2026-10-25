import { initializeApp, getApps, getApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase Client Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAo5izKnIVO6VMaU5fF8bXFlPvXSzKtGoc",
  authDomain: "to-do-list-99a24.firebaseapp.com",
  projectId: "to-do-list-99a24",
  storageBucket: "to-do-list-99a24.firebasestorage.app",
  messagingSenderId: "389135264589",
  appId: "1:389135264589:android:c7fbc1aa0ce13343136504",
  webClientId: "389135264589-97c4a2601q4bc3ukptrkmgi9brdmecg4.apps.googleusercontent.com",
};

export const WEB_CLIENT_ID = firebaseConfig.webClientId;
export const PROJECT_ID = firebaseConfig.projectId;

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

function getFirebaseAuth(): firebaseAuth.Auth {
  const getPersistence = (firebaseAuth as any).getReactNativePersistence;
  const initAuth = (firebaseAuth as any).initializeAuth;

  if (typeof initAuth === 'function' && typeof getPersistence === 'function') {
    try {
      return initAuth(app, {
        persistence: getPersistence(AsyncStorage),
      });
    } catch (_e) {
      return firebaseAuth.getAuth(app);
    }
  }
  return firebaseAuth.getAuth(app);
}

export const auth = getFirebaseAuth();
