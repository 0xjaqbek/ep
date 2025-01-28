// src/scripts/initialize-sequences.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC8zZ9l8X2yU2TaFKaGuXKxqv6qsE2bM_U",
  authDomain: "punkty999-31eff.firebaseapp.com",
  projectId: "punkty999-31eff",
  storageBucket: "punkty999-31eff.firebasestorage.app",
  messagingSenderId: "583933881300",
  appId: "1:583933881300:web:27cb02772e5adc1e4c8441",
  measurementId: "G-RZ6YEM3JFZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const initializeSequences = async () => {
  try {
    await setDoc(doc(db, 'sequences', 'invoice_sequence'), {
      currentNumber: 0,
      year: new Date().getFullYear(),
      lastUpdated: new Date()
    });
    console.log('Sequence initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing sequence:', error);
    process.exit(1);
  }
};

initializeSequences();