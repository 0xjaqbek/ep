// File: src/components/Admin/DashboardStats.tsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore'; 
import { db } from '../../firebase/config.ts';

export const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    completedCourses: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Pobierz liczbe użytkowników
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      // Pobierz kursy i przychody
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      const courses = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      const totalCourses = courses.length;

      // Pobierz ukończone kursy
      const completedCoursesCount = usersSnapshot.docs.reduce((acc, doc) => {
        const userData = doc.data();
        return acc + (userData.completedCourses?.length || 0);
      }, 0);

      // Pobierz zamówienia z WooCommerce
      const ordersResponse = await fetch(
        `${process.env.REACT_APP_WOOCOMMERCE_API_URL}/orders?status=completed`,
        {
          headers: {
            Authorization: `Basic ${btoa(`${process.env.REACT_APP_WC_CONSUMER_KEY}:${process.env.REACT_APP_WC_CONSUMER_SECRET}`)}`
          }
        }
      );
      const orders = await ordersResponse.json();
      const totalRevenue = orders.reduce((acc, order) => acc + parseFloat(order.total), 0);

      setStats({
        totalUsers,
        totalCourses,
        totalRevenue,
        completedCourses: completedCoursesCount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Użytkownicy</h3>
        <p className="text-3xl font-bold">{stats.totalUsers}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Kursy</h3>
        <p className="text-3xl font-bold">{stats.totalCourses}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Przychód</h3>
        <p className="text-3xl font-bold">{stats.totalRevenue.toFixed(2)} PLN</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Ukończone kursy</h3>
        <p className="text-3xl font-bold">{stats.completedCourses}</p>
      </div>
    </div>
  );
};