import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../Auth/AuthProvider.tsx';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { User } from '../../types';
import { Toast } from '../Feedback/Toast.tsx';

const ReferralDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [referredUsers, setReferredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  const referralLink = useMemo(() => {
    if (!currentUser?.referralCode) return '';
    return `${window.location.origin}/register?ref=${currentUser.referralCode}`;
  }, [currentUser?.referralCode]);

  const fetchReferredUsers = async () => {
    if (!currentUser?.referralCode) {
      console.log('No referral code for current user');
      return;
    }
  
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('referredBy', '==', currentUser.referralCode),
        orderBy('createdAt', 'desc')
      );
  
      const snapshot = await getDocs(q);
      
      console.log('Referral code:', currentUser.referralCode);
      console.log('Number of referred users:', snapshot.size);
      
      snapshot.docs.forEach(doc => {
        console.log('Referred user data:', doc.data());
      });
  
      const users = snapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as User[];
  
      setReferredUsers(users);
    } catch (error) {
      console.error('Error fetching referred users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferredUsers();
  }, [currentUser]);

  const copyToClipboard = async () => {
    try {
      if (!referralLink) return;
      await navigator.clipboard.writeText(referralLink);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const calculateRewards = () => {
    const points = currentUser?.referralPoints || 0;
    const availableFreeCourses = Math.floor(points / 10);
    const pointsToNextCourse = 10 - (points % 10);

    return {
      availableFreeCourses,
      pointsToNextCourse,
      totalPoints: points,
    };
  };

  const { availableFreeCourses, pointsToNextCourse, totalPoints } = calculateRewards();

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
            className="flex-1 p-2 border rounded bg-gray-50"
          />
          <button
            onClick={copyToClipboard}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Kopiuj
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Twój kod polecający: <span className="font-medium">{currentUser?.referralCode}</span>
        </p>
        <p className="text-sm text-gray-500">
            Udostępnij ten link znajomym. Za każdą zarejestrowaną osobę otrzymasz 1 punkt.
          </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Twoje nagrody</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span>Punkty</span>
              <span className="font-bold text-blue-600">{totalPoints}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span>Dostępne darmowe kursy</span>
              <span className="font-bold text-green-600">{availableFreeCourses}</span>
            </div>
            {pointsToNextCourse < 10 && (
              <p className="text-sm text-gray-600">
                Jeszcze {pointsToNextCourse} punktów do kolejnego darmowego kursu
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Poleceni użytkownicy</h2>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : referredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table-auto w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2">Imię i nazwisko</th>
                    <th className="border border-gray-300 px-4 py-2">Email</th>
                    <th className="border border-gray-300 px-4 py-2">Data dołączenia</th>
                  </tr>
                </thead>
                <tbody>
                  {referredUsers.map(user => (
                    <tr key={user.uid}>
                      <td className="border border-gray-300 px-4 py-2">{user.displayName}</td>
                      <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {user.createdAt?.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Brak poleconych użytkowników
            </p>
          )}
        </div>
      </div>

      {showToast && (
        <Toast
          message="Link skopiowany do schowka!"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};
export default ReferralDashboard;