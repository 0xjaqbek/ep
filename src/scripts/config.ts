import * as dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

dotenv.config({ path: '.env' });

const firebaseConfig = {
  apiKey: "AIzaSyC8zZ9l8X2yU2TaFKaGuXKxqv6qsE2bM_U",
  authDomain: "punkty999-31eff.firebaseapp.com",
  projectId: "punkty999-31eff",
  storageBucket: "punkty999-31eff.firebasestorage.app",
  messagingSenderId: "583933881300",
  appId: "1:583933881300:web:27cb02772e5adc1e4c8441",
  measurementId: "G-RZ6YEM3JFZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);