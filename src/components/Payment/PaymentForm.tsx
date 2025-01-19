// src/components/Payment/PaymentForm.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthProvider.tsx';
import { P24Service } from '../../services/payment/p24Service.ts';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
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

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const p24Service = new P24Service();
      const paymentData = {
        courseId: state.courseId,
        userId: currentUser.uid,
        amount: state.coursePrice,
        email: currentUser.email,
        customerData: {
          firstName: currentUser.displayName.split(' ')[0] || '',
          lastName: currentUser.displayName.split(' ')[1] || '',
          phone: currentUser.phoneNumber,
          address: currentUser.address.street,
          postal: currentUser.address.postalCode,
          city: currentUser.address.city
        }
      };

      const order = await p24Service.createOrder(paymentData);
      window.location.href = order.payment_url;
    } catch (error) {
      setError('Wystąpił błąd podczas inicjowania płatności. Spróbuj ponownie.');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    setLoading(true);
    try {
      console.log('Current auth user:', auth.currentUser);
      const userRef = doc(db, 'users', auth.currentUser!.uid);
      
      const userDoc = await getDoc(userRef);
      console.log('User document exists:', userDoc.exists());
      console.log('User data:', userDoc.data());

      await updateDoc(userRef, {
        purchasedCourses: arrayUnion(state.courseId)
      });

      navigate('/payment/success', {
        state: {
          courseId: state.courseId,
          courseTitle: state.courseTitle
        }
      });
    } catch (error) {
      console.error('Pełny błąd:', error);
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