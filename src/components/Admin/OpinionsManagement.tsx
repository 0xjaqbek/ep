// src/components/Admin/OpinionsManagement.tsx
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';

interface Opinion {
  id: string;
  courseId: string;
  courseName: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

const OpinionsManagement: React.FC = () => {
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpinions();
  }, []);

  const fetchOpinions = async () => {
    try {
      const opinionsRef = collection(db, 'course_ratings');
      const snapshot = await getDocs(opinionsRef);
      const opinionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Opinion[];

      setOpinions(opinionsData.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate()));
    } catch (error) {
      console.error('Error fetching opinions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (opinionId: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę opinię?')) {
      try {
        await deleteDoc(doc(db, 'course_ratings', opinionId));
        setOpinions(prev => prev.filter(opinion => opinion.id !== opinionId));
      } catch (error) {
        console.error('Error deleting opinion:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Opinie</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Użytkownik
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kurs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ocena
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Komentarz
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {opinions.map((opinion) => (
              <tr key={opinion.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {opinion.createdAt.toDate().toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{opinion.userName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{opinion.courseName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-yellow-500">
                    {'★'.repeat(opinion.rating)}{'☆'.repeat(5 - opinion.rating)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{opinion.comment}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(opinion.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OpinionsManagement;