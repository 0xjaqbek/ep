// src/components/User/InvoiceRequest.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthProvider.tsx';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { Payment, Course } from '../../types';

// In your InvoiceRequest.tsx
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
          console.log("Current user purchased courses:", currentUser.purchasedCourses); // Debug log
      
          // Get all courses first
          const coursesRef = collection(db, 'courses');
          const courseSnapshot = await getDocs(coursesRef);
          
          const allCourses = courseSnapshot.docs.reduce((acc, doc) => {
            acc[doc.id] = { ...doc.data(), id: doc.id };
            return acc;
          }, {});
      
          console.log("All courses:", allCourses); // Debug log
      
          // Fetch payments
          const paymentsRef = collection(db, 'payments');
          const paymentSnapshot = await getDocs(query(paymentsRef,
            where('userId', '==', currentUser.uid),
            where('status', '==', 'completed')
          ));
          
          const payments = paymentSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
          })) as Payment[];
      
          console.log("User payments:", payments); // Debug log
      
          // Filter courses based on purchasedCourses array
          const courses = currentUser.purchasedCourses
            .map(courseId => {
              const courseData = allCourses[courseId];
              if (!courseData) {
                console.log(`Course not found: ${courseId}`); // Debug log
                return null;
              }
      
              const payment = payments.find(p => p.courseId === courseId);
              console.log(`Payment for course ${courseId}:`, payment); // Debug log
      
              // Include course if it has payment and no invoice yet
              if (payment && !payment.invoiceIssued) {
                return {
                  ...courseData,
                  payment
                };
              }
              return null;
            })
            .filter(course => course !== null);
      
          console.log("Final filtered courses:", courses); // Debug log
      
          setPurchasedCourses(courses);
        } catch (error) {
          console.error('Error fetching courses:', error);
          setError('Wystąpił błąd podczas ładowania kursów');
        } finally {
          setLoading(false);
        }
      };
  
    const handleSubmit = async () => {
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
  
        // Calculate amounts using payment amount if available, otherwise use course price
        const courseAmounts = selectedCoursesData.map(course => 
          course.payment?.amount || course.price
        );
  
        // Calculate total using the same amounts we're storing
        const totalAmount = courseAmounts.reduce((sum, amount) => sum + amount, 0);
  
        await addDoc(collection(db, 'invoiceRequests'), {
          userId: currentUser.uid,
          userName: currentUser.displayName,
          userEmail: currentUser.email,
          courseIds: selectedCourses,
          courseTitles: selectedCoursesData.map(course => course.title),
          courseAmounts,
          totalAmount,
          status: 'pending',
          createdAt: serverTimestamp(),
          invoiceData: currentUser.invoiceData,
        });
  
        setSuccess('Prośba o fakturę została wysłana');
        setSelectedCourses([]);
        await fetchPurchasedCourses(); // Refresh the list
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
            Aby wygenerować fakturę, najpierw uzupełnij dane do faktury w ustawieniach konta i ZAPISZ ZMIANY.
          </div>
        )}
  
        {purchasedCourses.length === 0 ? (
          <p className="text-gray-500 text-center">
            Brak kursów do wygenerowania faktury
          </p>
        ) : (
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
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <label htmlFor={course.id} className="flex-1">
                  <div className="font-medium">{course.title}</div>
                  <div className="text-sm text-gray-500">
                    Cena: {course.payment?.amount || course.price} PLN
                  </div>
                </label>
              </div>
            ))}
  
            <button
              onClick={handleSubmit}
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
        )}
      </div>
    );
  };