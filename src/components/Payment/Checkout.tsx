// src/components/Payment/Checkout.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthProvider.tsx';
import { useCart } from '../../contexts/CartContext.tsx';
import { P24Service } from '../../services/payment/p24Service.ts';
import { LoadingSpinner } from '../Loading/LoadingSpinner.tsx';
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { DiscountCode } from '../../types';
import { P24PaymentData } from '../../types/payment.ts';

export const Checkout: React.FC = () => {
  const { currentUser } = useAuth();
  const { state: cartState, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);

  const verifyDiscountCode = async (code: string) => {
    try {
      const codesRef = collection(db, 'discountCodes');
      const q = query(
        codesRef, 
        where('code', '==', code),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setError('Nieprawidłowy kod rabatowy');
        return;
      }
  
      const discountDoc = snapshot.docs[0];
      const discountData = discountDoc.data() as Omit<DiscountCode, 'id'>;
      const now = new Date();
  
      // Validate discount code
      if (
        discountData.validFrom > now ||
        (discountData.validTo && discountData.validTo < now) ||
        (discountData.maxUses && discountData.currentUses >= discountData.maxUses)
      ) {
        setError('Kod rabatowy jest nieważny lub został wykorzystany');
        return;
      }
  
      // Create the discount object correctly
      const discount: DiscountCode = {
        id: discountDoc.id,  // Set id first
        ...discountData     // Then spread the data
      };
  
      setAppliedDiscount(discount);
      setError('');
    } catch (error) {
      console.error('Error verifying discount code:', error);
      setError('Wystąpił błąd podczas weryfikacji kodu');
    }
  };

  const calculateDiscountedPrice = (originalPrice: number): number => {
    if (!appliedDiscount) return originalPrice;
    const discount = originalPrice * (appliedDiscount.discountPercent / 100);
    return Math.round((originalPrice - discount) * 100) / 100;
  };

  const handlePayment = async () => {
    // First check if user exists and has a valid ID
    if (!currentUser?.uid) {
      navigate('/login');
      return;
    }
  
    setLoading(true);
    setError('');
  
    try {
      const finalPrice = calculateDiscountedPrice(cartState.total);
      
      // Create payment data after confirming user ID exists
      const paymentData: P24PaymentData = {
        userId: currentUser.uid, // Now we know this exists
        email: currentUser.email,
        amount: finalPrice,
        originalPrice: cartState.total,
        finalPrice: finalPrice,
        customerData: {
          firstName: currentUser.displayName.split(' ')[0] || '',
          lastName: currentUser.displayName.split(' ')[1] || '',
          phone: currentUser.phoneNumber,
          address: currentUser.address.street,
          postal: currentUser.address.postalCode,
          city: currentUser.address.city,
        },
        courses: cartState.items.map(item => ({
          courseId: item.courseId,
          courseTitle: item.courseTitle,
          amount: item.price
        }))
      };
  
      if (appliedDiscount) {
        const discountRef = doc(collection(db, 'discountCodes'), appliedDiscount.id);
        await updateDoc(discountRef, {
          currentUses: appliedDiscount.currentUses + 1
        });
      }
  
      const p24Service = new P24Service();
      const order = await p24Service.createOrder(paymentData);
      clearCart();
      window.location.href = order.payment_url;
  
    } catch (error) {
      console.error('Error processing payment:', error);
      setError('Wystąpił błąd podczas przetwarzania płatności');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!currentUser?.uid) {
      navigate('/login');
      return;
    }
  
    setLoading(true);
    setError('');
  
    try {
      // Add courses to user's purchased courses
      const userRef = doc(collection(db, 'users'), currentUser.uid); // Fixed doc reference
      await updateDoc(userRef, {
        purchasedCourses: arrayUnion(...cartState.items.map(item => item.courseId))
      });
  
      // Update discount code usage if applied
      if (appliedDiscount) {
        const discountRef = doc(collection(db, 'discountCodes'), appliedDiscount.id); // Fixed doc reference
        await updateDoc(discountRef, {
          currentUses: appliedDiscount.currentUses + 1
        });
      }
  
      clearCart();
      navigate('/payment/success', {
        state: {
          courseIds: cartState.items.map(item => item.courseId),
          courseTitles: cartState.items.map(item => item.courseTitle)
        }
      });
    } catch (error) {
      console.error('Error simulating payment:', error);
      setError('Wystąpił błąd podczas symulacji płatności');
    } finally {
      setLoading(false);
    }
  };

  if (cartState.items.length === 0) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-xl font-bold mb-4">Koszyk jest pusty</h2>
        <button
          onClick={() => navigate('/courses')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Przeglądaj kursy
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Podsumowanie zamówienia</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-8 space-y-4">
        <h3 className="font-semibold">Wybrane kursy:</h3>
        {cartState.items.map(item => (
          <div key={item.courseId} className="flex justify-between items-center py-2 border-b">
            <span>{item.courseTitle}</span>
            <span>{item.price} PLN</span>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h3 className="font-semibold mb-2">Kod rabatowy</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="Wpisz kod rabatowy"
          />
          <button
            onClick={() => verifyDiscountCode(discountCode)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            Zastosuj
          </button>
        </div>
        {appliedDiscount && (
          <p className="mt-2 text-green-600">
            Zastosowano rabat: {appliedDiscount.discountPercent}%
          </p>
        )}
      </div>

      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span>Suma:</span>
          <span>{cartState.total} PLN</span>
        </div>
        {appliedDiscount && (
          <div className="flex justify-between items-center mb-2 text-green-600">
            <span>Rabat ({appliedDiscount.discountPercent}%):</span>
            <span>-{(cartState.total - calculateDiscountedPrice(cartState.total)).toFixed(2)} PLN</span>
          </div>
        )}
        <div className="flex justify-between items-center font-bold text-lg">
          <span>Do zapłaty:</span>
          <span>{calculateDiscountedPrice(cartState.total)} PLN</span>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
        >
          {loading ? <LoadingSpinner size="small" /> : 'Zapłać przez Przelewy24'}
        </button>

        <button
          onClick={handleSimulatePayment}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-400"
        >
          {loading ? <LoadingSpinner size="small" /> : 'Symuluj płatność'}
        </button>

        <button
          onClick={() => navigate('/courses')}
          disabled={loading}
          className="w-full border border-gray-300 py-3 px-4 rounded-lg hover:bg-gray-50"
        >
          Wróć do kursów
        </button>
      </div>
    </div>
  );
};

export default Checkout;