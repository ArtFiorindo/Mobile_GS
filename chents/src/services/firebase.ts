import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAjnXZdMpFzKK1enBTK98KwFgeqsetVT5o",
  authDomain: "chents-9ede4.firebaseapp.com",
  projectId: "chents-9ede4",
  storageBucket: "chents-9ede4.firebasestorage.app",
  messagingSenderId: "368821624127",
  appId: "1:368821624127:web:5660106d58c921b11e478a",
  measurementId: "G-HQEBYQ33WX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);