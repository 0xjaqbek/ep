// File: src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './components/Auth/AuthProvider.tsx';
import { AdminLayout } from './components/Admin/AdminLayout.tsx';
import { DashboardStats } from './components/Admin/DashboardStats.tsx';
import { CourseManagement } from './components/Admin/CourseManagement.tsx';
import { UserManagement } from './components/Admin/UserManagement.tsx';
import { PaymentCallback } from './components/Payment/PaymentCallback.tsx';
import { Login } from './components/Auth/Login.tsx';
import { CourseList } from './components/Courses/CourseList.tsx';
import { Register } from './components/Auth/Register.tsx';
import { PaymentForm } from './components/Payment/PaymentForm.tsx';
import { PaymentSuccess } from './components/Payment/PaymentSuccess.tsx';
import { Header } from './components/Layout/Header.tsx';
import { CourseView } from './components/Courses/CourseView.tsx';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Header /> {/* Dodajemy komponent Header */}
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <Routes>
              {/* Strona główna */}
              <Route path="/" element={<Navigate to="/courses" replace />} />
              
              {/* Publiczne ścieżki */}
              <Route path="/login" element={<Login />} />
              <Route path="/courses" element={<CourseList />} />
              <Route path="/payment/callback" element={<PaymentCallback />} />
              <Route path="/payment/checkout" element={<PaymentForm />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/course/:id/learn" element={<CourseView />} />

              {/* Rejestracja */}
              <Route path="/register" element={<Register />} />
              
              {/* Ścieżki admina */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardStats />} />
                <Route path="courses" element={<CourseManagement />} />
                <Route path="users" element={<UserManagement />} />
              </Route>

              {/* Obsługa 404 */}
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center min-h-screen">
                  <h1 className="text-2xl font-bold mb-4">404 - Strona nie znaleziona</h1>
                  <Link 
                    to="/"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Wróć do strony głównej
                  </Link>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;