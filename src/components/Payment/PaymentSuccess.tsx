// src/components/Payment/PaymentSuccess.tsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthProvider.tsx';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { LoadingSpinner } from '../Loading/LoadingSpinner.tsx';

interface LocationState {
  courseIds: string[];
  courseTitles: string[];
}

interface CourseDetails {
  id: string;
  title: string;
  duration: number;
  points: number;
}

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshUserData, currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseDetails[]>([]);
  const state = location.state as LocationState;

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!state?.courseIds) {
        setLoading(false);
        return;
      }

      try {
        const coursePromises = state.courseIds.map(id => 
          getDoc(doc(db, 'courses', id))
        );

        const courseSnapshots = await Promise.all(coursePromises);
        const courseDetails = courseSnapshots.map(snapshot => ({
          id: snapshot.id,
          ...snapshot.data()
        })) as CourseDetails[];

        setCourses(courseDetails);
      } catch (error) {
        console.error('Error fetching course details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [state?.courseIds]);

  const handleStartCourse = async (courseId: string) => {
    await refreshUserData();
    navigate(`/course/${courseId}/learn`);
  };

  const handleViewAllCourses = async () => {
    await refreshUserData();
    navigate('/courses');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-md">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg 
            className="w-8 h-8 text-green-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Płatność zakończona sukcesem!
        </h2>
        
        <p className="text-gray-600 mb-6">
          Dziękujemy za zakup. Twoje kursy są już dostępne.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Zakupione kursy:</h3>
        <div className="space-y-4">
          {courses.map(course => (
            <div 
              key={course.id} 
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-lg">{course.title}</h4>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>Czas trwania: {course.duration} min</p>
                    <p>Punkty edukacyjne: {course.points}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleStartCourse(course.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Rozpocznij
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleViewAllCourses}
          className="w-full max-w-md bg-gray-100 text-gray-700 px-6 py-3 rounded hover:bg-gray-200 transition-colors"
        >
          Wróć do listy kursów
        </button>
        
        {currentUser?.invoiceData && (
          <Link 
            to="/account/invoices" 
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Przejdź do faktur
          </Link>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;