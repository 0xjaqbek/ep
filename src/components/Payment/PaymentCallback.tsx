// src/components/Payment/PaymentCallback.tsx
import React, { useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { P24Service } from '../../services/payment/p24Service.ts';

export const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Memoizacja instancji P24Service
  const p24Service = useMemo(() => new P24Service(), []);

  const verifyPayment = useCallback(async () => {
    const orderId = searchParams.get('order_id');
    if (!orderId) {
      navigate('/payment-error');
      return;
    }

    const isSuccess = await p24Service.verifyPayment(orderId);
    
    if (isSuccess) {
      try {
        const orderResponse = await fetch(
          `${process.env.REACT_APP_WOOCOMMERCE_API_URL}/orders/${orderId}`,
          {
            headers: {
              Authorization: `Basic ${btoa(`${process.env.REACT_APP_WC_CONSUMER_KEY}:${process.env.REACT_APP_WC_CONSUMER_SECRET}`)}`
            }
          }
        );
        const orderData = await orderResponse.json();

        const courseId = orderData.meta_data.find((m: any) => m.key === 'courseId')?.value;
        const userId = orderData.meta_data.find((m: any) => m.key === 'userId')?.value;

        if (courseId && userId) {
          await updateDoc(doc(db, 'users', userId), {
            purchasedCourses: arrayUnion(courseId)
          });

          navigate('/payment-success');
        } else {
          throw new Error('Brak danych kursu lub użytkownika');
        }
      } catch (error) {
        console.error('Błąd podczas przetwarzania płatności:', error);
        navigate('/payment-error');
      }
    } else {
      navigate('/payment-error');
    }
  }, [searchParams, navigate, p24Service]);

  useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Weryfikacja płatności...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
};