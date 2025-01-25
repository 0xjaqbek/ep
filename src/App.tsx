// File: src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './components/Auth/AuthProvider.tsx';
import { PrivateRoute } from './components/Auth/PrivateRoute.tsx';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary.tsx';

// Admin Components
import { AdminLayout } from './components/Admin/AdminLayout.tsx';
import { AnalyticsDashboard } from './components/Admin/AnalyticsDashboard.tsx';
import { PaymentManagement } from './components/Admin/PaymentManagement.tsx';
import { CertificateManagement } from './components/Admin/CertificateManagement.tsx';
import { TestManagement } from './components/Admin/TestManagement.tsx';
import { CourseManagement } from './components/Admin/CourseManagement.tsx';
import { UserManagement } from './components/Admin/UserManagement.tsx';
import { MessagesManagement } from './components/Admin/MessagesManagement.tsx';
import { OpinionsManagement } from './components/Admin/OpinionsManagement.tsx';

// Auth Components
import { Login } from './components/Auth/Login.tsx';
import { Register } from './components/Auth/Register.tsx';

// Payment Components
import { PaymentCallback } from './components/Payment/PaymentCallback.tsx';
import { PaymentForm } from './components/Payment/PaymentForm.tsx';
import { PaymentSuccess } from './components/Payment/PaymentSuccess.tsx';

// Course Components
import { CourseList } from './components/Courses/CourseList.tsx';
import { CourseView } from './components/Courses/CourseView.tsx';

// Layout Components
import { Header } from './components/Layout/Header.tsx';
import LandingPage from './components/LandingPage.tsx';
import CookieConsent from './components/Common/CookieConsent.tsx';
import { UserAccount } from './components/User/UserAccount.tsx';
import { Footer } from './components/Layout/Footer.tsx';

import About from './components/About.tsx';
import Contact from './components/Contact.tsx';
import Regulations from './components/Regulations.tsx';

const NotFoundPage: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <h1 className="text-2xl font-bold mb-4">404 - Strona nie znaleziona</h1>
    <Link 
      to="/"
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      Wróć do strony głównej
    </Link>
  </div>
);

const UnauthorizedPage: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <h1 className="text-2xl font-bold mb-4">Brak dostępu</h1>
    <p className="mb-4">Nie masz uprawnień do wyświetlenia tej strony.</p>
    <Link 
      to="/"
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      Wróć do strony głównej
    </Link>
  </div>
);

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/*" element={
                <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                  <Routes>
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="unauthorized" element={<UnauthorizedPage />} />
                    <Route path="courses" element={<CourseList />} />
                    <Route path="about" element={<About />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="regulations" element={<Regulations />} />
                    
                    {/* Protected User Routes */}
                    <Route path="account" element={
                      <PrivateRoute>
                        <UserAccount />
                      </PrivateRoute>
                    } />
                    <Route path="course/:id/learn" element={
                      <PrivateRoute>
                        <CourseView />
                      </PrivateRoute>
                    } />
                    <Route path="payment/callback" element={
                      <PrivateRoute>
                        <PaymentCallback />
                      </PrivateRoute>
                    } />
                    <Route path="payment/checkout" element={
                      <PrivateRoute>
                        <PaymentForm />
                      </PrivateRoute>
                    } />
                    <Route path="payment/success" element={
                      <PrivateRoute>
                        <PaymentSuccess />
                      </PrivateRoute>
                    } />

                    {/* Protected Admin Routes */}
                    <Route path="admin" element={
                      <PrivateRoute requiredRole="admin">
                        <AdminLayout />
                      </PrivateRoute>
                    }>
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard" element={<AnalyticsDashboard />} />
                      <Route path="courses" element={<CourseManagement />} />
                      <Route path="tests" element={<TestManagement />} />
                      <Route path="users" element={<UserManagement />} />
                      <Route path="payments" element={<PaymentManagement />} />
                      <Route path="certificates" element={<CertificateManagement />} />
                      <Route path="messages" element={<MessagesManagement />} />
                      <Route path="opinions" element={<OpinionsManagement />} />
                    </Route>

                    {/* 404 Route */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
              } />
            </Routes>
            <CookieConsent />
            <Footer />
          </div>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;