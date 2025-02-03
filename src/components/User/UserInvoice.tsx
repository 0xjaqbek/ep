import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { useAuth } from '../Auth/AuthProvider.tsx';

interface UserInvoice {
  id: string;
  invoiceNumber: string;
  createdAt: Date;
  totalAmount: number;
  status: string;
  pdfUrl?: string;
  courseTitles: string[];
}

const UserInvoiceComponent: React.FC = () => {
  const { currentUser } = useAuth();
  const [invoices, setInvoices] = useState<UserInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      fetchUserInvoices();
    }
  }, [currentUser]);

  const fetchUserInvoices = async () => {
    try {
      const invoicesRef = collection(db, 'invoiceRequests');
      const q = query(
        invoicesRef,
        where('userId', '==', currentUser?.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const invoicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as UserInvoice[];

      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Could not load invoices');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-6">Moje faktury</h2>

      {error && (
        <div className="p-4 mb-4 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      {invoices.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          Nie masz jeszcze żadnych faktur
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Numer faktury
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kursy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kwota
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {invoice.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {invoice.invoiceNumber || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {invoice.courseTitles.join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {invoice.totalAmount.toFixed(2)} PLN
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      invoice.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : invoice.status === 'processed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {invoice.status === 'pending' ? 'Oczekuje'
                        : invoice.status === 'processed' ? 'Wystawiona'
                        : 'Odrzucona'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {invoice.status === 'processed' && invoice.pdfUrl && (
                      <a
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Pobierz PDF
                      </a>
                    )}
                    {invoice.status === 'rejected' && (
                      <span className="text-red-600">
                        Odrzucono
                      </span>
                    )}
                    {invoice.status === 'pending' && (
                      <span className="text-yellow-600">
                        W trakcie realizacji
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserInvoiceComponent;