import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA7PxCi6xPqC3wRsbaFbs6ikU5jONjJ8ck", // Taken from firebase-applet-config.json
  authDomain: "gen-lang-client-0794827119.firebaseapp.com",
  projectId: "gen-lang-client-0794827119",
  storageBucket: "gen-lang-client-0794827119.firebasestorage.app",
  messagingSenderId: "950654294073",
  appId: "1:950654294073:web:1fe53c247e657e17c8d5e8"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
export const auth = getAuth(app);
export { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };
