import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyDJY0aI-Uz83sajmczsVqNrUhcRsAtnF4Y",
  authDomain: "indrive-app-790b8.firebaseapp.com",
  projectId: "indrive-app-790b8",
  storageBucket: "indrive-app-790b8.firebasestorage.app",
  messagingSenderId: "742862640651",
  appId: "1:742862640651:web:c448b4b0f9b34ea271990e"
};
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);