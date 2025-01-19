// src/components/Admin/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';  // Usuwamy nieużywane importy query i where
import { db } from '../../firebase/config.ts';
import { User } from '../../types';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const usersData = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Błąd podczas pobierania listy użytkowników');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phoneNumber.includes(searchTerm)
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Zarządzanie użytkownikami</h2>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Szukaj użytkownika..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Nazwa</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Telefon</th>
              <th className="p-3 text-left">Adres</th>
              <th className="p-3 text-left">Kursy</th>
              <th className="p-3 text-left">Dane do faktury</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.uid} className="border-t">
                <td className="p-3">{user.displayName}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.phoneNumber}</td>
                <td className="p-3">
                  {user.address.street}, {user.address.postalCode} {user.address.city}
                </td>
                <td className="p-3">
                  <span className="font-bold">Zakupione:</span> {user.purchasedCourses.length}<br/>
                  <span className="font-bold">Ukończone:</span> {user.completedCourses.length}
                </td>
                <td className="p-3">
                  {user.invoiceData ? (
                    <>
                      {user.invoiceData.companyName}<br/>
                      NIP: {user.invoiceData.nip}<br/>
                      {user.invoiceData.companyAddress}
                    </>
                  ) : (
                    "Brak"
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