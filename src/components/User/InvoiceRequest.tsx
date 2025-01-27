// src/components/User/InvoiceRequest.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthProvider.tsx';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { Payment, Course } from '../../types';

export const InvoiceRequest: React.FC = () => {
  const { currentUser } = useAuth();
  const [purchasedCourses, setPurchasedCourses] = useState<Array<Course & { payment?: Payment }>>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPurchasedCourses();
  }, [currentUser]);

  const fetchPurchasedCourses = async () => {
    if (!currentUser) return;

    try {
      // Fetch courses
      const coursesRef = collection(db, 'courses');
      const courseSnapshot = await getDocs(query(coursesRef, 
        where('id', 'in', currentUser.purchasedCourses)
      ));
      
      // Fetch payments to check invoice status
      const paymentsRef = collection(db, 'payments');
      const paymentSnapshot = await getDocs(query(paymentsRef,
        where('userId', '==', currentUser.uid)
      ));
      
      const payments = paymentSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Payment[];

      const courses = courseSnapshot.docs.map(doc => {
        const courseData = {
          ...doc.data(),
          id: doc.id
        } as Course;
        
        const payment = payments.find(p => p.courseId === courseData.id);
        return {
          ...courseData,
          payment
        };
      });

      setPurchasedCourses(courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Wystąpił błąd podczas ładowania kursów');
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceRequest = async () => {
    if (!currentUser?.invoiceData) {
      setError('Uzupełnij dane do faktury w ustawieniach konta i zapisz zmiany');
      return;
    }

    if (selectedCourses.length === 0) {
      setError('Wybierz co najmniej jeden kurs');
      return;
    }

    try {
      const selectedCoursesData = purchasedCourses.filter(
        course => selectedCourses.includes(course.id)
      );

      const totalAmount = selectedCoursesData.reduce(
        (sum, course) => sum + (course.payment?.amount || course.price),
        0
      );

      await addDoc(collection(db, 'invoiceRequests'), {
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userEmail: currentUser.email,
        courseIds: selectedCourses,
        courseTitles: selectedCoursesData.map(course => course.title),
        status: 'pending',
        createdAt: serverTimestamp(),
        invoiceData: currentUser.invoiceData,
        totalAmount
      });

      setSuccess('Prośba o fakturę została wysłana');
      setSelectedCourses([]);
    } catch (error) {
      console.error('Error requesting invoice:', error);
      setError('Wystąpił błąd podczas wysyłania prośby o fakturę');
    }
  };

  if (loading) {
    return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Poproś o fakturę</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded">
          {success}
        </div>
      )}

      {!currentUser?.invoiceData && (
        <div className="mb-4 p-4 bg-yellow-50 text-yellow-700 rounded">
          Aby wygenerować fakturę, najpierw uzupełnij dane do faktury w ustawieniach konta.
        </div>
      )}

      <div className="space-y-4">
        {purchasedCourses.map(course => (
          <div key={course.id} className="flex items-center space-x-4">
            <input
              type="checkbox"
              id={course.id}
              value={course.id}
              checked={selectedCourses.includes(course.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedCourses([...selectedCourses, course.id]);
                } else {
                  setSelectedCourses(selectedCourses.filter(id => id !== course.id));
                }
              }}
              disabled={course.payment?.invoiceIssued}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <label htmlFor={course.id} className="flex-1">
              <div className="font-medium">{course.title}</div>
              <div className="text-sm text-gray-500">
                Cena: {course.payment?.amount || course.price} PLN
              </div>
              {course.payment?.invoiceIssued && (
                <div className="text-sm text-green-600">
                  Faktura została już wystawiona
                </div>
              )}
            </label>
          </div>
        ))}
      </div>

      <button
        onClick={handleInvoiceRequest}
        disabled={!currentUser?.invoiceData || selectedCourses.length === 0}
        className={`mt-6 w-full py-2 px-4 rounded ${
          !currentUser?.invoiceData || selectedCourses.length === 0
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        Poproś o fakturę
      </button>
    </div>
  );
};