// src/components/Payment/PaymentForm.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthProvider.tsx';
import { P24Service } from '../../services/payment/p24Service.ts';
import { doc, updateDoc, arrayUnion, getDoc, increment, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db, auth } from '../../firebase/config.ts';

interface LocationState {
  courseId: string;
  courseTitle: string;
  coursePrice: number;
}

export const PaymentForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const state = location.state as LocationState;

  useEffect(() => {
    if (!state?.courseId || !currentUser) {
      navigate('/courses');
    }
  }, [state, currentUser, navigate]);

  if (!state?.courseId || !currentUser) {
    return null;
  }


  const handleReferralPoints = async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);
  
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
  
      if (userData.referredBy && !userData.referralRewarded) {
        const referrerCode = userData.referredBy;
  
        // Find the referrer
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('referralCode', '==', referrerCode));
        const snapshot = await getDocs(q);
  
        if (!snapshot.empty) {
          const referrer = snapshot.docs[0];
  
          // Increment points for the referrer
          await updateDoc(doc(db, 'users', referrer.id), {
            referralPoints: increment(10), // Give points for course purchase
          });
  
          // Mark the referred user as rewarded
          await updateDoc(userRef, {
            referralRewarded: true,
          });
        }
      }
    }
  };
  

  const handlePayment = async () => {
    setLoading(true);
    setError('');
  
    try {
      if (!currentUser?.uid) {
        throw new Error('Użytkownik nie jest zalogowany');
      }
  
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
  
      if (userData?.referredBy) {
        // Find referrer
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('referralCode', '==', userData.referredBy));
        const snapshot = await getDocs(q);
  
        if (!snapshot.empty) {
          const referrerDoc = snapshot.docs[0];
          
          // Award points to referrer
          await updateDoc(doc(db, 'users', referrerDoc.id), {
            referralPoints: increment(10)
          });
  
          // Award points to the referred user (current user)
          await updateDoc(userRef, {
            referralPoints: increment(5)
          });
        }
      }
  
      const p24Service = new P24Service();
      const paymentData = {
        courseId: state.courseId,
        userId: currentUser.uid,
        amount: state.coursePrice,
        email: currentUser.email,
        courseTitle: state.courseTitle,
        customerData: {
          firstName: currentUser.displayName.split(' ')[0] || '',
          lastName: currentUser.displayName.split(' ')[1] || '',
          phone: currentUser.phoneNumber,
          address: currentUser.address.street,
          postal: currentUser.address.postalCode,
          city: currentUser.address.city,
        },
      };
  
      const order = await p24Service.createOrder(paymentData);
      window.location.href = order.payment_url;
  
    } catch (error) {
      console.error('Payment error:', error);
      setError('Wystąpił błąd podczas inicjowania płatności. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

// Updated handleSimulatePayment
const handleSimulatePayment = async () => {
  setLoading(true);
  try {
    if (!auth.currentUser?.uid) {
      throw new Error("User is not authenticated");
    }

    const userRef = doc(db, 'users', auth.currentUser.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    // First update purchased courses
    await updateDoc(userRef, {
      purchasedCourses: arrayUnion(state.courseId)
    });

    // Handle referral points if applicable
    if (userData?.referredBy) {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referralCode', '==', userData.referredBy));
      const referrerSnapshot = await getDocs(q);

      if (!referrerSnapshot.empty) {
        const referrerDoc = referrerSnapshot.docs[0];
        
        // Single batch write for both updates
        const batch = writeBatch(db);
        
        // Update referrer points
        batch.update(doc(db, 'users', referrerDoc.id), {
          referralPoints: increment(10)
        });
        
        // Update current user points
        batch.update(userRef, {
          referralPoints: increment(5)
        });

        await batch.commit();
      }
    }

    navigate('/payment/success', {
      state: {
        courseId: state.courseId,
        courseTitle: state.courseTitle,
      },
    });
  } catch (error) {
    console.error('Payment error:', error);
    setError('Wystąpił błąd podczas symulacji płatności.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Podsumowanie zamówienia</h2>
      
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Szczegóły kursu:</h3>
        <p>Nazwa: {state.courseTitle}</p>
        <p>Cena: {state.coursePrice} PLN</p>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Dane do płatności:</h3>
        <p>Email: {currentUser.email}</p>
        <p>Imię i nazwisko: {currentUser.displayName}</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={handlePayment}
          disabled={loading}
          className={`w-full py-2 px-4 rounded text-white ${
            loading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Przetwarzanie...' : 'Zapłać przez Przelewy24'}
        </button>

        <button
          onClick={handleSimulatePayment}
          disabled={loading}
          className={`w-full py-2 px-4 rounded text-white ${
            loading 
              ? 'bg-green-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {loading ? 'Symulacja...' : 'Symuluj udaną płatność'}
        </button>

        <button
          onClick={() => navigate('/courses')}
          className="w-full py-2 px-4 rounded border border-gray-300 hover:bg-gray-50"
        >
          Anuluj
        </button>
      </div>
    </div>
  );
};