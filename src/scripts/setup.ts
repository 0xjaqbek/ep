import { auth, db } from './config';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const setupAdmin = async () => {
  try {
    // Stwórz użytkownika w Authentication
    const adminEmail = "jaqbek.eth@gmail.com";
    const adminPassword = "Admin123!@#";
    
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      adminEmail, 
      adminPassword
    );

    console.log('Konto w Authentication zostało utworzone');

    // Dodaj dokument użytkownika z rolą admin
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: adminEmail,
      displayName: "Administrator",
      role: "admin",
      phoneNumber: "",
      address: {
        street: "",
        city: "",
        postalCode: "",
        country: "Poland"
      },
      purchasedCourses: [],
      completedCourses: [],
      createdAt: new Date()
    });

    console.log('Administrator został utworzony:', userCredential.user.uid);

    // Dodaj przykładowy kurs
    const courseRef = await addDoc(collection(db, 'courses'), {
      title: "Wprowadzenie do programowania",
      description: "Poznaj podstawy programowania w przystępny sposób. Kurs obejmuje podstawy JavaScript, HTML i CSS.",
      price: 299,
      videoUrl: "",
      duration: 180,
      testQuestions: [
        {
          id: "1",
          question: "Co to jest zmienna?",
          options: [
            "Miejsce w pamięci przechowujące dane",
            "Funkcja matematyczna",
            "Element HTML",
            "Styl CSS"
          ],
          correctAnswer: 0
        }
      ],
      thumbnail: "",
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Przykładowy kurs został utworzony:', courseRef.id);

  } catch (error) {
    console.error('Błąd podczas tworzenia admina lub kursu:', error);
    if (error instanceof Error) {
      console.error('Szczegóły błędu:', error.message);
    }
  }
};

// Wywołaj funkcję
setupAdmin();