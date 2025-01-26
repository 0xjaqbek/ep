// components/Referrals/ReferralDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../Auth/AuthProvider.tsx';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { User } from '../../types';

export const ReferralDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [referredUsers, setReferredUsers] = useState<User[]>([]);
  const referralLink = `${window.location.origin}/register?ref=${currentUser?.referralCode}`;

  useEffect(() => {
    if (!currentUser?.referralCode) return;
    
    const fetchReferredUsers = async () => {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referredBy', '==', currentUser.referralCode));
      const snapshot = await getDocs(q);
      setReferredUsers(snapshot.docs.map(doc => ({ ...doc.data() } as User)));
    };

    fetchReferredUsers();
  }, [currentUser]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Link skopiowany do schowka!');
  };

  const availableFreeCourses = Math.floor(currentUser?.referralPoints || 0 / 10);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Program poleceń</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Twój link polecający</h2>
        <div className="flex items-center gap-4">
          <input 
            type="text" 
            value={referralLink} 
            readOnly 
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={copyToClipboard}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Kopiuj
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Twój kod polecający: {currentUser?.referralCode}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Statystyki</h2>
          <div className="space-y-2">
            <p>Punkty: {currentUser?.referralPoints || 0}</p>
            <p>Liczba poleceń: {referredUsers.length}</p>
            <p>Dostępne darmowe kursy: {availableFreeCourses}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Poleceni użytkownicy</h2>
          {referredUsers.length > 0 ? (
            <ul className="space-y-2">
              {referredUsers.map(user => (
                <li key={user.uid} className="text-gray-700">
                  {user.displayName}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Brak poleconych użytkowników</p>
          )}
        </div>
      </div>
    </div>
  );
};