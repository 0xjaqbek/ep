// src/components/Payment/PaymentSuccess.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthProvider.tsx';

interface LocationState {
  courseId: string;
  courseTitle: string;
}

export const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshUserData } = useAuth();
  const state = location.state as LocationState;

  const handleStartCourse = async () => {
    // Refresh user data to ensure we have the latest course access
    await refreshUserData();
    navigate(`/course/${state?.courseId}/learn`);
  };

  const handleViewCourses = async () => {
    // Refresh user data before navigating to courses
    await refreshUserData();
    navigate('/courses');
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold mb-4">Płatność zakończona sukcesem!</h2>
      
      {state?.courseTitle && (
        <p className="mb-6">
          Kurs "{state.courseTitle}" został dodany do Twoich zakupionych kursów.
        </p>
      )}

      <div className="space-y-4">
        <button
          onClick={handleStartCourse}
          className="block w-full py-2 px-4 rounded text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Rozpocznij kurs
        </button>
        
        <button
          onClick={handleViewCourses}
          className="block w-full py-2 px-4 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Wróć do listy kursów
        </button>
      </div>
    </div>
  );
};