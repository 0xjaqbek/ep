// File: src/components/Payment/PaymentCallback.tsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { P24Service } from '../../services/payment/p24Service';

export const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const p24Service = new P24Service();

  useEffect(() => {
    const verifyPayment = async () => {
      const orderId = searchParams.get('order_id');
      if (!orderId) {
        navigate('/payment-error');
        return;
      }

      const isSuccess = await p24Service.verifyPayment(orderId);
      
      if (isSuccess) {
        try {
          // Pobierz dane zamówienia z WooCommerce
          const orderResponse = await fetch(
            `${process.env.REACT_APP_WOOCOMMERCE_API_URL}/orders/${orderId}`,
            {
              headers: {
                Authorization: `Basic ${btoa(`${process.env.REACT_APP_WC_CONSUMER_KEY}:${process.env.REACT_APP_WC_CONSUMER_SECRET}`)}`
              }
            }
          );
          const orderData = await orderResponse.json();

          // Znajdź courseId i userId w metadanych zamówienia
          const courseId = orderData.meta_data.find(m => m.key === 'courseId')?.value;
          const userId = orderData.meta_data.find(m => m.key === 'userId')?.value;

          if (courseId && userId) {
            // Aktualizuj dane użytkownika w Firebase
            await updateDoc(doc(db, 'users', userId), {
              purchasedCourses: arrayUnion(courseId)
            });

            navigate('/payment-success');
          } else {
            throw new Error('Missing course or user data');
          }
        } catch (error) {
          console.error('Error processing successful payment:', error);
          navigate('/payment-error');
        }
      } else {
        navigate('/payment-error');
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-bold mb-4">Weryfikacja płatności...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
};
