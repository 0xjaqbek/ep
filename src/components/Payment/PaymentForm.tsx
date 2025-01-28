// src/components/Payment/PaymentForm.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthProvider.tsx';
import { P24Service, P24PaymentData } from '../../services/payment/p24Service.ts';
import { doc, updateDoc, arrayUnion, getDoc, increment, collection, query, where, getDocs, writeBatch, serverTimestamp, addDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config.ts';
import { DiscountCode } from '../../types/index.ts';

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
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [discountError, setDiscountError] = useState('');

  const state = location.state as LocationState;

  useEffect(() => {
    if (!state?.courseId || !currentUser) {
      navigate('/courses');
    }
  }, [state, currentUser, navigate]);

  if (!state?.courseId || !currentUser) {
    return null;
  }

    // Add validation helper function
  const isDiscountValid = (discount: DiscountCode): boolean => {
    const now = new Date();
    
    if (!discount.isActive) return false;
    if (now < discount.validFrom) return false;
    if (discount.validTo && now > discount.validTo) return false;
    if (discount.maxUses && discount.currentUses >= discount.maxUses) return false;
    
    return true;
  };

  // Add discount verification function
  const verifyDiscountCode = async (code: string) => {
    try {
      console.log('Verifying code:', code);
      const codesRef = collection(db, 'discountCodes');
      const q = query(codesRef, where('code', '==', code), where('isActive', '==', true));
      
      // Add debug log for the query
      console.log('Running query...');
      const snapshot = await getDocs(q);
      console.log('Query results:', snapshot.empty ? 'No results' : 'Found results');
  
      if (snapshot.empty) {
        setDiscountError('Nieprawidłowy kod rabatowy');
        return;
      }
  
      const discountCodeData = snapshot.docs[0].data();
      console.log('Discount code data:', discountCodeData);
  
      const discountCode = {
        id: snapshot.docs[0].id,
        ...discountCodeData,
        validFrom: discountCodeData.validFrom?.toDate(),
        validTo: discountCodeData.validTo?.toDate() || null
      } as DiscountCode;
  
      console.log('Checking validity...');
      if (!isDiscountValid(discountCode)) {
        console.log('Validation failed', {
          isActive: discountCode.isActive,
          validFrom: discountCode.validFrom,
          validTo: discountCode.validTo,
          currentUses: discountCode.currentUses,
          maxUses: discountCode.maxUses
        });
        setDiscountError('Kod rabatowy jest nieważny lub został wykorzystany');
        return;
      }
  
      console.log('Code is valid, applying discount');
      setAppliedDiscount(discountCode);
      setDiscountError('');
    } catch (error) {
      console.error('Error verifying discount code:', error);
      setDiscountError('Wystąpił błąd podczas weryfikacji kodu');
    }
  };

  // Add price calculation function
  const calculateDiscountedPrice = (originalPrice: number) => {
    if (!appliedDiscount) return originalPrice;
    const discount = originalPrice * (appliedDiscount.discountPercent / 100);
    return Math.round((originalPrice - discount) * 100) / 100;
  };

  // Add discount usage update function
  const updateDiscountUsage = async (discountId: string) => {
    const discountRef = doc(db, 'discountCodes', discountId);
    await updateDoc(discountRef, {
      currentUses: increment(1)
    });
  };


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
  
      const finalPrice = calculateDiscountedPrice(state.coursePrice);
      
      const paymentData: P24PaymentData = {
        courseId: state.courseId,
        userId: currentUser.uid,
        amount: finalPrice,
        originalPrice: state.coursePrice,
        finalPrice: finalPrice,
        email: currentUser.email,
        courseTitle: state.courseTitle,
        customerData: {
          firstName: currentUser.displayName.split(' ')[0] || '',
          lastName: currentUser.displayName.split(' ')[1] || '',
          phone: currentUser.phoneNumber,
          address: currentUser.address.street,
          postal: currentUser.address.postalCode,
          city: currentUser.address.city,
        }
      };
  
      if (appliedDiscount) {
        paymentData.discountCode = appliedDiscount.code;
        paymentData.discountAmount = state.coursePrice - finalPrice;
        await updateDiscountUsage(appliedDiscount.id);
      }
  
      const p24Service = new P24Service();
      const order = await p24Service.createOrder(paymentData);
      window.location.href = order.payment_url;
  
    } catch (error) {
      console.error('Payment error:', error);
      setError('Wystąpił błąd podczas inicjowania płatności');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    setLoading(true);
    try {
      if (!auth.currentUser?.uid) {
        throw new Error("User is not authenticated");
      }
  
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
  
      // Calculate final price with discount
      const finalPrice = calculateDiscountedPrice(state.coursePrice);
  
      // First update purchased courses
      await updateDoc(userRef, {
        purchasedCourses: arrayUnion(state.courseId)
      });
  
      // Handle discount code usage if applied
      if (appliedDiscount) {
        await updateDiscountUsage(appliedDiscount.id);
      }
  
      // Handle referral points if applicable
      if (userData?.referredBy) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('referralCode', '==', userData.referredBy));
        const referrerSnapshot = await getDocs(q);
  
        if (!referrerSnapshot.empty) {
          const referrerDoc = referrerSnapshot.docs[0];
          
          const batch = writeBatch(db);
          
          batch.update(doc(db, 'users', referrerDoc.id), {
            referralPoints: increment(10)
          });
          
          batch.update(userRef, {
            referralPoints: increment(5)
          });
  
          await batch.commit();
        }
      }
  
      // Create payment record with optional discount fields
      const paymentData = {
        userId: auth.currentUser.uid,
        courseId: state.courseId,
        amount: finalPrice,
        originalPrice: state.coursePrice,
        finalPrice: finalPrice,
        status: 'completed',
        createdAt: serverTimestamp(),
        courseTitle: state.courseTitle,
        // Only include discount fields if there is an applied discount
        ...(appliedDiscount && {
          discountCode: appliedDiscount.code,
          discountAmount: state.coursePrice - finalPrice
        })
      };
  
      // Add payment record
      await addDoc(collection(db, 'payments'), paymentData);
  
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

      <div className="mb-4">
        <label className="block mb-1">Kod rabatowy</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="Wpisz kod rabatowy"
          />
          <button
            type="button"
            onClick={() => verifyDiscountCode(discountCode)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            Zastosuj
          </button>
        </div>
        {discountError && <p className="text-red-500 text-sm mt-1">{discountError}</p>}
      {appliedDiscount && (
        <p className="text-green-500 text-sm mt-1">
          Zastosowano zniżkę {appliedDiscount.discountPercent}%
        </p>
      )}
      </div>

      <div className="bg-white shadow rounded-lg p-6 my-6">
        <h3 className="font-semibold mb-4">Podsumowanie zamówienia</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Kurs:</span>
            <span>{state.courseTitle}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Cena:</span>
            <div className="text-right">
              {appliedDiscount ? (
                <>
                  <div className="text-sm line-through text-gray-500">
                    {state.coursePrice.toFixed(2)} PLN
                  </div>
                  <div className="text-green-600">
                    {calculateDiscountedPrice(state.coursePrice).toFixed(2)} PLN
                  </div>
                </>
              ) : (
                <div>{state.coursePrice.toFixed(2)} PLN</div>
              )}
            </div>
          </div>
          {appliedDiscount && (
            <div className="flex justify-between text-green-600">
              <span>Zniżka:</span>
              <span>-{appliedDiscount.discountPercent}%</span>
            </div>
          )}
        </div>
      </div>

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
          disabled={loading}
        >
          Anuluj
        </button>
      </div>
    </div>
  );
};