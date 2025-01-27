import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, addDoc, updateDoc, Timestamp, where } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { DiscountCode } from '../../types';

export const DiscountManagement: React.FC = () => {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState({
    code: '',
    discountPercent: 0,
    validFrom: new Date(),
    validTo: null as Date | null,
    maxUses: null as number | null,
    isActive: true
  });

  useEffect(() => {
    fetchDiscountCodes();
  }, []);

  const fetchDiscountCodes = async () => {
    try {
      const codesRef = collection(db, 'discountCodes');
      const snapshot = await getDocs(codesRef);
      const codes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        validFrom: doc.data().validFrom.toDate(),
        validTo: doc.data().validTo?.toDate() || null
      })) as DiscountCode[];
      
      setDiscountCodes(codes);
    } catch (error) {
      console.error('Error fetching discount codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const codeData = {
        ...newCode,
        currentUses: 0,
        validFrom: Timestamp.fromDate(newCode.validFrom),
        validTo: newCode.validTo ? Timestamp.fromDate(newCode.validTo) : null
      };

      await addDoc(collection(db, 'discountCodes'), codeData);
      await fetchDiscountCodes();
      setNewCode({
        code: '',
        discountPercent: 0,
        validFrom: new Date(),
        validTo: null,
        maxUses: null,
        isActive: true
      });
    } catch (error) {
      console.error('Error adding discount code:', error);
    }
  };

  const toggleCodeStatus = async (code: DiscountCode) => {
    try {
      await updateDoc(doc(db, 'discountCodes', code.id), {
        isActive: !code.isActive
      });
      await fetchDiscountCodes();
    } catch (error) {
      console.error('Error toggling code status:', error);
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
      <h2 className="text-2xl font-bold mb-6">Zarządzanie kodami rabatowymi</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Kod</label>
            <input
              type="text"
              value={newCode.code}
              onChange={(e) => setNewCode({...newCode, code: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Zniżka (%)</label>
            <input
              type="number"
              value={newCode.discountPercent}
              onChange={(e) => setNewCode({...newCode, discountPercent: Number(e.target.value)})}
              className="w-full p-2 border rounded"
              min="0"
              max="100"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Data rozpoczęcia</label>
            <input
              type="date"
              value={newCode.validFrom.toISOString().split('T')[0]}
              onChange={(e) => setNewCode({...newCode, validFrom: new Date(e.target.value)})}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Data zakończenia (opcjonalnie)</label>
            <input
              type="date"
              value={newCode.validTo?.toISOString().split('T')[0] || ''}
              onChange={(e) => setNewCode({...newCode, validTo: e.target.value ? new Date(e.target.value) : null})}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-1">Limit użyć (opcjonalnie)</label>
            <input
              type="number"
              value={newCode.maxUses || ''}
              onChange={(e) => setNewCode({...newCode, maxUses: e.target.value ? Number(e.target.value) : null})}
              className="w-full p-2 border rounded"
              min="1"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Dodaj kod rabatowy
        </button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kod</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zniżka</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ważność</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Użycia</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {discountCodes.map(code => (
              <tr key={code.id}>
                <td className="px-6 py-4">{code.code}</td>
                <td className="px-6 py-4">{code.discountPercent}%</td>
                <td className="px-6 py-4">
                  {code.validFrom.toLocaleDateString()} - 
                  {code.validTo ? code.validTo.toLocaleDateString() : 'Bezterminowo'}
                </td>
                <td className="px-6 py-4">
                  {code.currentUses}/{code.maxUses || '∞'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    code.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {code.isActive ? 'Aktywny' : 'Nieaktywny'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleCodeStatus(code)}
                    className={`text-sm ${
                      code.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
                    }`}
                  >
                    {code.isActive ? 'Dezaktywuj' : 'Aktywuj'}
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