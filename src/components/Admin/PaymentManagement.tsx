// src/components/Admin/PaymentManagement.tsx
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';

interface Payment {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentDate: Date;
  userEmail: string;
  courseName: string;
  transactionId: string;
}

export const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const paymentsRef = collection(db, 'payments');
      const q = query(paymentsRef, orderBy('paymentDate', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const paymentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Payment[];

      setPayments(paymentsData);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPayments = () => {
    let filtered = [...payments];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(payment => payment.status === filterStatus);
    }

    // Filter by date
    const now = new Date();
    switch (dateRange) {
      case 'today':
        filtered = filtered.filter(payment => {
          const paymentDate = new Date(payment.paymentDate);
          return paymentDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        filtered = filtered.filter(payment => {
          const paymentDate = new Date(payment.paymentDate);
          return paymentDate >= weekAgo;
        });
        break;
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        filtered = filtered.filter(payment => {
          const paymentDate = new Date(payment.paymentDate);
          return paymentDate >= monthAgo;
        });
        break;
    }

    return filtered;
  };

  const getTotalRevenue = (filteredPayments: Payment[]) => {
    return filteredPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const filteredPayments = getFilteredPayments();
  const totalRevenue = getTotalRevenue(filteredPayments);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Zarządzanie Płatnościami</h2>

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">Wszystkie statusy</option>
          <option value="completed">Zakończone</option>
          <option value="pending">Oczekujące</option>
          <option value="failed">Nieudane</option>
          <option value="refunded">Zwrócone</option>
        </select>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="p-2 border rounded"
        >
          <option value="all">Cały okres</option>
          <option value="today">Dzisiaj</option>
          <option value="week">Ostatni tydzień</option>
          <option value="month">Ostatni miesiąc</option>
        </select>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-2">Podsumowanie</h3>
        <p className="text-2xl font-bold text-green-600">{totalRevenue.toFixed(2)} PLN</p>
        <p className="text-sm text-gray-600">Łączny przychód z wybranych płatności</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr className="bg-gray-50">
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
                Kwota
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Transakcji
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPayments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(payment.paymentDate).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {payment.userEmail}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {payment.courseName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {payment.amount.toFixed(2)} PLN
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${payment.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                    ${payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${payment.status === 'failed' ? 'bg-red-100 text-red-800' : ''}
                    ${payment.status === 'refunded' ? 'bg-gray-100 text-gray-800' : ''}
                  `}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {payment.transactionId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};