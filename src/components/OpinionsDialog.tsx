import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config.ts';

interface Opinion {
  id: string;
  courseName: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export const OpinionsDialog: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchOpinions();
    }
  }, [isOpen]);

  const fetchOpinions = async () => {
    try {
      const opinionsRef = collection(db, 'course_ratings');
      const q = query(opinionsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const opinionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Opinion[];
      setOpinions(opinionsData);
    } catch (error) {
      console.error('Error fetching opinions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Opinie użytkowników</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : opinions.length === 0 ? (
            <p className="text-center text-gray-500">Brak opinii</p>
          ) : (
            <div className="space-y-6">
              {opinions.map((opinion) => (
                <div key={opinion.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <div>
                      <div className="font-medium">{opinion.userName}</div>
                      <div className="text-sm text-gray-500">{opinion.courseName}</div>
                    </div>
                    <div className="text-yellow-400 text-lg">
                      {'★'.repeat(opinion.rating)}{'☆'.repeat(5 - opinion.rating)}
                    </div>
                  </div>
                  <p className="text-gray-700">{opinion.comment}</p>
                  <div className="text-sm text-gray-500 mt-2">
                    {opinion.createdAt.toDate().toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};