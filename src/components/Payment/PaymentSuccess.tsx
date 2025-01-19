// src/components/Payment/PaymentSuccess.tsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';

interface LocationState {
  courseId: string;
  courseTitle: string;
}

export const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState;

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
        <Link
          to={`/course/${state?.courseId}/learn`}
          className="block w-full py-2 px-4 rounded text-white bg-blue-600 hover:bg-blue-700"
        >
          Rozpocznij kurs
        </Link>
        
        <Link
          to="/courses"
          className="block w-full py-2 px-4 rounded border border-gray-300 hover:bg-gray-50"
        >
          Wróć do listy kursów
        </Link>
      </div>
    </div>
  );
};