// src/components/Admin/InvoiceManagement.tsx
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc, where, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { InvoiceRequest } from '../../types';

export const InvoiceManagement: React.FC = () => {
  const [invoiceRequests, setInvoiceRequests] = useState<InvoiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoiceRequests();
  }, []);

  const fetchInvoiceRequests = async () => {
    try {
      const requestsRef = collection(db, 'invoiceRequests');
      const q = query(requestsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as InvoiceRequest[];

      setInvoiceRequests(requests);
    } catch (error) {
      console.error('Error fetching invoice requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: 'processed' | 'rejected') => {
    try {
      const requestRef = doc(db, 'invoiceRequests', requestId);
      await updateDoc(requestRef, {
        status: newStatus
      });

      if (newStatus === 'processed') {
        // Update invoice status for the courses
        const request = invoiceRequests.find(r => r.id === requestId);
        if (request) {
          const paymentsRef = collection(db, 'payments');
          const q = query(paymentsRef, 
            where('userId', '==', request.userId),
            where('courseId', 'in', request.courseIds)
          );
          const snapshot = await getDocs(q);
          
          const batch = writeBatch(db);
          snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { invoiceIssued: true });
          });
          await batch.commit();
        }
      }

      await fetchInvoiceRequests();
    } catch (error) {
      console.error('Error updating invoice request:', error);
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
      <h2 className="text-2xl font-bold mb-6">Prośby o faktury</h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Użytkownik</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kursy</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kwota</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akcje</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoiceRequests.map(request => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {request.createdAt.toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{request.userName}</div>
                  <div className="text-sm text-gray-500">{request.userEmail}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {request.courseTitles.join(', ')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {request.totalAmount.toFixed(2)} PLN
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    request.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : request.status === 'processed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {request.status === 'pending' ? 'Oczekujące'
                      : request.status === 'processed' ? 'Zrealizowane'
                      : 'Odrzucone'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {request.status === 'pending' && (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleStatusChange(request.id, 'processed')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Zatwierdź
                      </button>
                      <button
                        onClick={() => handleStatusChange(request.id, 'rejected')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Odrzuć
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};