// src/components/User/UserAccount.tsx
import React, { useState } from 'react';
import { useAuth } from '../Auth/AuthProvider.tsx';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { LoadingSpinner } from '../Loading/LoadingSpinner.tsx';
import { User } from '../../types';

export const UserAccount: React.FC = () => {
  const { currentUser, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    phoneNumber: currentUser?.phoneNumber || '',
    address: {
      street: currentUser?.address?.street || '',
      city: currentUser?.address?.city || '',
      postalCode: currentUser?.address?.postalCode || '',
      country: currentUser?.address?.country || 'Poland',
    },
    invoiceData: {
      companyName: currentUser?.invoiceData?.companyName || '',
      nip: currentUser?.invoiceData?.nip || '',
      companyAddress: currentUser?.invoiceData?.companyAddress || '',
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!currentUser?.uid) throw new Error('No user logged in');

      const userRef = doc(db, 'users', currentUser.uid);
      const updateData = {
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        invoiceData: formData.invoiceData.nip ? formData.invoiceData : null
      };

      await updateDoc(userRef, updateData);
      await refreshUserData();
      setSuccess('Dane zostały zaktualizowane');
    } catch (error) {
      console.error('Error updating user data:', error);
      setError('Wystąpił błąd podczas aktualizacji danych');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Moje konto</h1>

      <div className="bg-white shadow rounded-lg mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Dane osobowe</h2>
          
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Imię i nazwisko</label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Telefon</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ulica i numer</label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Kod pocztowy</label>
                <input
                  type="text"
                  name="address.postalCode"
                  value={formData.address.postalCode}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Miasto</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dane do faktury (opcjonalnie)</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Nazwa firmy</label>
                <input
                  type="text"
                  name="invoiceData.companyName"
                  value={formData.invoiceData.companyName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">NIP</label>
                <input
                  type="text"
                  name="invoiceData.nip"
                  value={formData.invoiceData.nip}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Adres firmy</label>
                <input
                  type="text"
                  name="invoiceData.companyAddress"
                  value={formData.invoiceData.companyAddress}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? <LoadingSpinner size="small" /> : 'Zapisz zmiany'}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Moje kursy</h2>
          
          {currentUser.purchasedCourses?.length === 0 ? (
            <p className="text-gray-500">Nie masz jeszcze żadnych kursów</p>
          ) : (
            <div className="space-y-4">
              {currentUser.purchasedCourses?.map((courseId: string) => (
                <div key={courseId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      {/* Course info would be displayed here */}
                      <p className="text-gray-600">ID kursu: {courseId}</p>
                    </div>
                    {currentUser.completedCourses?.some(cc => cc.courseId === courseId) && (
                      <button
                        onClick={() => {/* Certificate download logic */}}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Pobierz certyfikat
                      </button>
                    )}
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