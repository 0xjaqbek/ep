// src/components/Admin/AnalyticsDashboard.tsx
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  lastLoginDate?: Timestamp;
}

interface Course {
  id: string;
  title: string;
  enrolledCount: number;
  completedCount: number;
}

interface Payment {
  id: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Timestamp;
}

interface Certificate {
  id: string;
  courseId: string;
  userId: string;
  createdAt: Timestamp;
}

interface RevenueData {
  date: string;
  amount: number;
}

interface UserData {
  date: string;
  count: number;
}

interface CourseData {
  name: string;
  value: number;
}

interface CertificateData {
  date: string;
  count: number;
}

interface AnalyticsData {
  revenue: {
    daily: RevenueData[];
    monthly: RevenueData[];
    total: number;
  };
  users: {
    total: number;
    active: number;
    new: UserData[];
  };
  courses: {
    total: number;
    completion: CourseData[];
    popular: CourseData[];
  };
  certificates: {
    total: number;
    monthly: CertificateData[];
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const now = Timestamp.now();
      const startDate = new Date();
      let startTimestamp: Timestamp;

      switch (timeRange) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          startTimestamp = Timestamp.fromDate(startDate);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          startTimestamp = Timestamp.fromDate(startDate);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          startTimestamp = Timestamp.fromDate(startDate);
          break;
      }

      // Fetch payments
      const paymentsRef = collection(db, 'payments');
      const paymentsQuery = query(
        paymentsRef,
        where('createdAt', '>=', startTimestamp),
        orderBy('createdAt', 'desc')
      );
      const paymentsSnapshot = await getDocs(paymentsQuery);
      const payments = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Payment[];

      // Fetch users
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const users = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as User[];

      // Fetch courses
      const coursesRef = collection(db, 'courses');
      const coursesSnapshot = await getDocs(coursesRef);
      const courses = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];

      // Fetch certificates
      const certificatesRef = collection(db, 'certificates');
      const certificatesSnapshot = await getDocs(certificatesRef);
      const certificates = certificatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Certificate[];

      const analyticsData: AnalyticsData = {
        revenue: calculateRevenueData(payments),
        users: {
          total: users.length,
          active: users.filter(u => 
            u.lastLoginDate && u.lastLoginDate.toDate() >= startDate
          ).length,
          new: calculateNewUsersData(users, startDate)
        },
        courses: {
          total: courses.length,
          completion: calculateCourseCompletionData(courses),
          popular: calculatePopularCourses(courses)
        },
        certificates: {
          total: certificates.length,
          monthly: calculateMonthlyCertificates(certificates)
        }
      };

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRevenueData = (payments: Payment[]) => {
    const daily: RevenueData[] = [];
    const monthly: RevenueData[] = [];
    let total = 0;

    payments.forEach(payment => {
      if (payment.status === 'completed') {
        total += payment.amount;
        const date = payment.createdAt.toDate();
        const dayKey = date.toISOString().split('T')[0];
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        // Daily data
        const dayIndex = daily.findIndex(d => d.date === dayKey);
        if (dayIndex >= 0) {
          daily[dayIndex].amount += payment.amount;
        } else {
          daily.push({ date: dayKey, amount: payment.amount });
        }

        // Monthly data
        const monthIndex = monthly.findIndex(m => m.date === monthKey);
        if (monthIndex >= 0) {
          monthly[monthIndex].amount += payment.amount;
        } else {
          monthly.push({ date: monthKey, amount: payment.amount });
        }
      }
    });

    return { daily, monthly, total };
  };

  const calculateNewUsersData = (users: User[], startDate: Date): UserData[] => {
    const userData: { [key: string]: number } = {};

    users.forEach(user => {
      if (user.createdAt.toDate() >= startDate) {
        const date = user.createdAt.toDate().toISOString().split('T')[0];
        userData[date] = (userData[date] || 0) + 1;
      }
    });

    return Object.entries(userData)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const calculateCourseCompletionData = (courses: Course[]): CourseData[] => {
    return courses.map(course => ({
      name: course.title,
      value: course.completedCount || 0
    }));
  };

  const calculatePopularCourses = (courses: Course[]): CourseData[] => {
    return courses
      .map(course => ({
        name: course.title,
        value: course.enrolledCount || 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const calculateMonthlyCertificates = (certificates: Certificate[]): CertificateData[] => {
    const monthlyData: { [key: string]: number } = {};

    certificates.forEach(cert => {
      const date = cert.createdAt.toDate();
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    return Object.entries(monthlyData)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Analityka</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
          className="p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="week">Ostatni tydzień</option>
          <option value="month">Ostatni miesiąc</option>
          <option value="year">Ostatni rok</option>
        </select>
      </div>

      {analytics && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm uppercase">Przychód całkowity</h3>
              <p className="text-2xl font-bold text-green-600">
                {analytics.revenue.total.toFixed(2)} PLN
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm uppercase">Aktywni użytkownicy</h3>
              <p className="text-2xl font-bold text-blue-600">
                {analytics.users.active}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm uppercase">Ukończone kursy</h3>
              <p className="text-2xl font-bold text-purple-600">
                {analytics.courses.completion.reduce((sum, item) => sum + item.value, 0)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm uppercase">Wydane certyfikaty</h3>
              <p className="text-2xl font-bold text-orange-600">
                {analytics.certificates.total}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Przychody</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.revenue.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="amount" name="Przychód" stroke="#0088FE" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* New Users Chart */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Nowi użytkownicy</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.users.new}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Nowi użytkownicy" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Course Completion Chart */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Ukończenia kursów</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.courses.completion}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {analytics.courses.completion.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Certificates Chart */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Wydane certyfikaty</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.certificates.monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Liczba certyfikatów"
                    stroke="#FF8042"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};